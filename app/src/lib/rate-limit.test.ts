import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit, clientIpFromForwardedFor } from "./rate-limit";

describe("clientIpFromForwardedFor", () => {
  it("末尾（GFE 付加の改ざん不能な実クライアント）を返す。手前の詐称値は無視", () => {
    expect(clientIpFromForwardedFor("1.1.1.1, 2.2.2.2, 3.3.3.3")).toBe("3.3.3.3");
  });
  it("単一値はそのまま", () => {
    expect(clientIpFromForwardedFor("9.9.9.9")).toBe("9.9.9.9");
  });
  it("null / 空文字は unknown", () => {
    expect(clientIpFromForwardedFor(null)).toBe("unknown");
    expect(clientIpFromForwardedFor("")).toBe("unknown");
    expect(clientIpFromForwardedFor(" , ")).toBe("unknown");
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ウィンドウ内で max 回までは許可、超過は拒否", () => {
    const key = "k-a";
    expect(checkRateLimit(key, 3, 1000)).toBe(true);
    expect(checkRateLimit(key, 3, 1000)).toBe(true);
    expect(checkRateLimit(key, 3, 1000)).toBe(true);
    expect(checkRateLimit(key, 3, 1000)).toBe(false);
  });

  it("ウィンドウ経過後はカウントがリセットされる", () => {
    const key = "k-b";
    expect(checkRateLimit(key, 1, 1000)).toBe(true);
    expect(checkRateLimit(key, 1, 1000)).toBe(false);
    vi.setSystemTime(1001);
    expect(checkRateLimit(key, 1, 1000)).toBe(true);
  });

  it("キーごとに独立してカウントする", () => {
    expect(checkRateLimit("k-c", 1, 1000)).toBe(true);
    expect(checkRateLimit("k-d", 1, 1000)).toBe(true);
    expect(checkRateLimit("k-c", 1, 1000)).toBe(false);
  });
});
