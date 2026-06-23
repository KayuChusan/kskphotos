"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/mail";

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
      subject: `【撮影依頼】${d.name} 様 / ${service.title}`,
      text: `お名前: ${d.name}\nメール: ${d.email}\n電話: ${d.phone ?? "-"}\nプラン: ${service.title}\n希望日: ${d.date ?? "-"}\n場所: ${d.location ?? "-"}\n\n${composedMessage}`,
      replyTo: d.email,
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
