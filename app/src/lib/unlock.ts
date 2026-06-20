import { createHmac, createHash, randomBytes, timingSafeEqual } from "crypto";

/**
 * 会員解錠（コレクション単位）の共通ロジック。
 * - トークンは平文を一度だけ表示し、DB にはハッシュのみ保存（`tokenHash`）。
 * - 解錠状態は署名付き Cookie に「コレクションID＋トークンID」の組で保持する。
 *   トークンID を持たせることで、管理画面でトークンを失効すると既発行 Cookie も
 *   サーバー側検証（unlock-server.ts）で無効化できる。
 * - 本ファイルは next/headers・DB に依存しない純粋関数のみ（テスト可能）。
 */

export const UNLOCK_COOKIE = "ksk_unlock";
export const UNLOCK_MAX_AGE = 60 * 60 * 24 * 30; // 30日（秒）

/** 解錠1件：コレクションID(c) と、その解錠に使ったトークンID(k) */
export interface UnlockEntry {
  c: string;
  k: string;
}

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required for unlock cookie signing");
  }
  return "dev-insecure-unlock-secret";
}

/** /u/<token> に載せる平文トークン（URL セーフ・推測不可） */
export function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

/** DB 保存・照合用のハッシュ（平文は保存しない） */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

interface UnlockPayload {
  e: UnlockEntry[];
  exp: number; // 失効時刻（ms）
}

function normalize(entries: UnlockEntry[]): UnlockEntry[] {
  const seen = new Set<string>();
  const out: UnlockEntry[] = [];
  for (const e of entries) {
    if (!e || typeof e.c !== "string" || typeof e.k !== "string") continue;
    const key = `${e.c}:${e.k}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ c: e.c, k: e.k });
  }
  return out;
}

/** 解錠エントリ配列を署名付き Cookie 値にする */
export function signUnlockValue(
  entries: UnlockEntry[],
  now: number = Date.now()
): string {
  const payload: UnlockPayload = {
    e: normalize(entries),
    exp: now + UNLOCK_MAX_AGE * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Cookie 値を検証して解錠エントリを返す（改ざん・期限切れは空配列） */
export function parseUnlockValue(
  value: string | undefined | null,
  now: number = Date.now()
): UnlockEntry[] {
  if (!value) return [];
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return [];
  const body = value.slice(0, dot);
  const mac = value.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return [];
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as UnlockPayload;
    if (!payload || typeof payload.exp !== "number" || payload.exp < now) {
      return [];
    }
    return Array.isArray(payload.e) ? normalize(payload.e) : [];
  } catch {
    return [];
  }
}

/** エントリ配列にコレクション＋トークンを追加（重複は除去） */
export function addEntry(
  entries: UnlockEntry[],
  collectionId: string,
  tokenId: string
): UnlockEntry[] {
  // 同じコレクションの古いトークンは置き換える（最新の解錠を優先）
  const kept = entries.filter((e) => e.c !== collectionId);
  return normalize([...kept, { c: collectionId, k: tokenId }]);
}

/** Cookie 書き込み時の共通オプション */
export function unlockCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: UNLOCK_MAX_AGE,
  };
}
