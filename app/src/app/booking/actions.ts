"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendNotification, sendAutoReply } from "@/lib/mail";
import { checkRateLimit, clientIpFromForwardedFor } from "@/lib/rate-limit";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kskworks.jp";

export type BookingState = {
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
  phone: z.string().trim().max(40).optional(),
  serviceId: z.string().trim().min(1, "ご依頼の種類を選択してください"),
  date: z.string().trim().optional(),
  location: z.string().trim().max(200).optional(),
  message: z.string().trim().max(4000).optional(),
});

// 公開フォーム（認証なし）。Booking を作成する。
export async function submitBooking(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  // ハニーポット: 隠しフィールドに値が入っていれば bot とみなし黙って成功扱いで破棄。
  if ((formData.get("company") as string)?.trim()) {
    return { status: "success", message: "ご相談を受け付けました。" };
  }

  // IP 単位の簡易レート制限（スパム / メールコスト DoS の抑止）
  const ip = clientIpFromForwardedFor((await headers()).get("x-forwarded-for"));
  if (!checkRateLimit(`booking:${ip}`, 5, 60_000)) {
    return {
      status: "error",
      message: "送信が続いています。しばらく時間をおいて再度お試しください。",
    };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    serviceId: formData.get("serviceId") || undefined,
    date: formData.get("date") || undefined,
    location: formData.get("location") || undefined,
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }
  const d = parsed.data;

  // 選択プランを検証（有効なプランのみ受理）し、依頼内容に控える
  const service = await prisma.service.findFirst({
    where: { id: d.serviceId, isActive: true },
    select: { id: true, title: true },
  });
  if (!service) {
    return { status: "error", message: "選択されたご依頼の種類が見つかりません" };
  }

  const composedMessage =
    `【ご依頼の種類】${service.title}` + (d.message ? `\n\n${d.message}` : "");

  let preferredDate: Date | undefined;
  if (d.date) {
    const dt = new Date(d.date);
    if (!Number.isNaN(dt.getTime())) preferredDate = dt;
  }

  try {
    await prisma.booking.create({
      data: {
        name: d.name,
        email: d.email,
        phone: d.phone || undefined,
        serviceId: service.id,
        preferredDate,
        location: d.location || undefined,
        message: composedMessage,
      },
    });
    await sendNotification({
      subject: `【撮影のご相談】${d.name} 様 / ${service.title}`,
      text: `お名前: ${d.name}\nメール: ${d.email}\n電話: ${d.phone ?? "-"}\nプラン: ${service.title}\n希望日: ${d.date ?? "-"}\n場所: ${d.location ?? "-"}\n\n${composedMessage}\n\n管理画面: ${siteUrl}/admin/bookings`,
      replyTo: d.email,
    });
    await sendAutoReply({
      to: d.email,
      subject: "【KSK Works】撮影のご相談を受け付けました",
      text: `${d.name} 様\n\nこの度はお問い合わせいただきありがとうございます。\n以下の内容で受け付けました。2営業日以内にご連絡いたします。\nお見積り・お打ち合わせのうえで撮影が確定します。\n\nプラン: ${service.title}\n希望日: ${d.date ?? "-"}\n場所: ${d.location ?? "-"}\n\n※本メールは自動送信です。お心当たりがない場合は破棄してください。\n\nKSK Works`,
    });
    return {
      status: "success",
      message: "ご相談を受け付けました。2営業日以内にご連絡いたします。",
    };
  } catch (err) {
    console.error("submitBooking error:", err);
    return {
      status: "error",
      message: "送信に失敗しました。時間をおいて再度お試しください。",
    };
  }
}
