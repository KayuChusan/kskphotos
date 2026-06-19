import { Resend } from "resend";

type Notification = {
  subject: string;
  text: string;
  replyTo?: string;
};

/**
 * 運営者への通知メールを送る。
 * - RESEND_API_KEY / NOTIFICATION_EMAIL が未設定なら何もしない（no-op）。
 * - 送信失敗は握りつぶしてログのみ（呼び出し側の DB 保存フローを妨げない）。
 */
export async function sendNotification({
  subject,
  text,
  replyTo,
}: Notification): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;
  if (!apiKey || !to) return;

  const from = process.env.NOTIFICATION_FROM ?? "KSK Works <noreply@kskworks.jp>";

  try {
    const resend = new Resend(apiKey);
    // Resend は API エラーを例外でなく { error } で返すため、明示的にログする
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      replyTo,
    });
    if (error) console.error("sendNotification (resend) error:", error);
  } catch (err) {
    console.error("sendNotification error:", err);
  }
}
