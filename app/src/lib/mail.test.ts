import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Resend が呼ばれていないことを確認するためにモック
const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn(() => ({ emails: { send: sendMock } })),
}));

import { sendNotification, sendAutoReply } from "./mail";

describe("mail（環境変数 未設定時は no-op）", () => {
  const original = { ...process.env };
  beforeEach(() => {
    sendMock.mockReset();
    delete process.env.RESEND_API_KEY;
    delete process.env.NOTIFICATION_EMAIL;
  });
  afterEach(() => {
    process.env = { ...original };
  });

  it("RESEND_API_KEY 未設定なら sendNotification は送信せず解決する", async () => {
    await expect(
      sendNotification({ subject: "s", text: "t" })
    ).resolves.toBeUndefined();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("RESEND_API_KEY 未設定なら sendAutoReply は送信せず解決する", async () => {
    await expect(
      sendAutoReply({ to: "a@example.com", subject: "s", text: "t" })
    ).resolves.toBeUndefined();
    expect(sendMock).not.toHaveBeenCalled();
  });
});
