"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type BookingState = {
  status: "idle" | "success" | "error";
  message?: string;
};

// 撮影プランの選択肢ラベル（PR-3 で Service.id 連動に置き換え予定）
const PLAN_LABELS: Record<string, string> = {
  profile: "政治・選挙（プロフィール / ポスター / 記録）",
  portrait: "ポートレート",
  family: "ファミリー / カップル",
  event: "イベント",
  commercial: "商用・法人",
  web: "サイト制作・IT サポート",
};

const schema = z.object({
  name: z.string().trim().min(1, "お名前は必須です").max(100),
  email: z
    .string()
    .trim()
    .email("メールアドレスの形式が正しくありません")
    .max(200),
  phone: z.string().trim().max(40).optional(),
  plan: z.string().trim().min(1, "撮影プランを選択してください"),
  date: z.string().trim().optional(),
  location: z.string().trim().max(200).optional(),
  message: z.string().trim().max(4000).optional(),
});

// 公開フォーム（認証なし）。Booking を作成する。
// 現状 serviceId は実 Service.id と未連動のため、選択プランは message に集約して記録する。
export async function submitBooking(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    plan: formData.get("plan") || undefined,
    date: formData.get("date") || undefined,
    location: formData.get("location") || undefined,
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }
  const d = parsed.data;
  const planLabel = PLAN_LABELS[d.plan] ?? d.plan;
  const composedMessage =
    `【ご希望プラン】${planLabel}` + (d.message ? `\n\n${d.message}` : "");

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
        preferredDate,
        location: d.location || undefined,
        message: composedMessage,
      },
    });
    return {
      status: "success",
      message: "ご依頼を受け付けました。2営業日以内にご連絡いたします。",
    };
  } catch (err) {
    console.error("submitBooking error:", err);
    return {
      status: "error",
      message: "送信に失敗しました。時間をおいて再度お試しください。",
    };
  }
}
