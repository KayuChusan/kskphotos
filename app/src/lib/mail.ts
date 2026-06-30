import { Resend } from "resend";

const FROM = process.env.NOTIFICATION_FROM ?? "KSK Works <noreply@kskworks.jp>";

// RESEND_API_KEY が未設定なら null（= 送らない）。
function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

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
  const to = process.env.NOTIFICATION_EMAIL;
  const resend = getClient();
  if (!resend || !to) return;

  try {
    // Resend は API エラーを例外でなく { error } で返すため、明示的にログする
    const { error } = await resend.emails.send({
      from: FROM,
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

type AutoReply = {
  to: string;
  subject: string;
  text: string;
};

/**
 * 送信者への自動返信（受付確認）。
 * - RESEND_API_KEY 未設定なら no-op。失敗は握りつぶす（送信フローを妨げない）。
 * - 返信先は運営の受信箱（NOTIFICATION_EMAIL）。to（送信者アドレス）はログに出さない。
 */
export async function sendAutoReply({
  to,
  subject,
  text,
}: AutoReply): Promise<void> {
  const resend = getClient();
  if (!resend) return;

  const replyTo = process.env.NOTIFICATION_EMAIL;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      text,
      replyTo,
    });
    if (error) console.error("sendAutoReply (resend) error:", error);
  } catch (err) {
    console.error("sendAutoReply error:", err);
  }
}
