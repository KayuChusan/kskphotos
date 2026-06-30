"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendNotification, sendAutoReply } from "@/lib/mail";
import { checkRateLimit, clientIpFromForwardedFor } from "@/lib/rate-limit";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kskworks.jp";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const schema = z.object({
  name: z.string().trim().min(1, "お名前は必須です").max(100),
  email: z
    .string()
    .trim()
    .email("メールアドレスの形式が正しくありません")
    .max(200),
  subject: z.string().trim().min(1, "件名は必須です").max(200),
  message: z.string().trim().min(1, "メッセージは必須です").max(4000),
});

// 公開フォーム（認証なし）。ContactMessage を作成する。
export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  // ハニーポット: 通常は隠しフィールド。値が入っていれば bot とみなし黙って成功扱いで破棄。
  if ((formData.get("company") as string)?.trim()) {
    return { status: "success", message: "送信しました。ご連絡ありがとうございます。" };
  }

  // IP 単位の簡易レート制限（スパム / メールコスト DoS の抑止）
  const ip = clientIpFromForwardedFor((await headers()).get("x-forwarded-for"));
  if (!checkRateLimit(`contact:${ip}`, 5, 60_000)) {
    return {
      status: "error",
      message: "送信が続いています。しばらく時間をおいて再度お試しください。",
    };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  try {
    await prisma.contactMessage.create({ data: parsed.data });
    await sendNotification({
      subject: `【お問い合わせ】${parsed.data.subject}`,
      text: `お名前: ${parsed.data.name}\nメール: ${parsed.data.email}\n件名: ${parsed.data.subject}\n\n${parsed.data.message}\n\n管理画面: ${siteUrl}/admin/messages`,
      replyTo: parsed.data.email,
    });
    await sendAutoReply({
      to: parsed.data.email,
      subject: "【KSK Works】お問い合わせを受け付けました",
      text: `${parsed.data.name} 様\n\nお問い合わせありがとうございます。以下の内容で受け付けました。追ってご連絡いたします。\n\n件名: ${parsed.data.subject}\n\n※本メールは自動送信です。お心当たりがない場合は破棄してください。\n\nKSK Works`,
    });
    return {
      status: "success",
      message: "送信しました。ご連絡ありがとうございます。",
    };
  } catch (err) {
    console.error("submitContact error:", err);
    return {
      status: "error",
      message: "送信に失敗しました。時間をおいて再度お試しください。",
    };
  }
}
