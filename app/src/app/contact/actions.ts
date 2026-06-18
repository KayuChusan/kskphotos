"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

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
