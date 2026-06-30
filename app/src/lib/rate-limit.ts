// 軽量な固定ウィンドウ・レート制限（キー単位）。
// scale-to-zero の単一インスタンス Cloud Run では十分。複数インスタンスへ拡張する場合は
// DB/Redis などの共有ストアに差し替える（その場合はインスタンス間で共有されない点に注意）。
const hits = new Map<string, { count: number; reset: number }>();

// メモリ上限。詐称 IP の大量投入等でもマップが無限に膨らまないよう、上限到達時に
// 期限切れエントリを掃除し、それでも超える場合は最古を1件退避させる。
const MAX_KEYS = 10_000;

/**
 * X-Forwarded-For から「信頼できる」クライアント IP を取り出す。
 * - 直 Cloud Run（本構成・前段に独自 LB なし）では、Google フロントエンドが実クライアント IP を
 *   XFF の「末尾」に付加する。クライアントが送った値はその手前に残るだけで末尾は改ざんできないため、
 *   末尾を採る＝詐称・バイパス・偽 IP によるマップ肥大を同時に防げる（各クライアント固有なので
 *   全員が同一バケットに集約されることもない）。
 * - 前段に独自 HTTP LB を挟む構成へ変える場合は、末尾が LB の IP になるため信頼ホップ位置の
 *   見直しが必要。これはスパムの best-effort 抑止であり（一次防御はハニーポット）。
 * - 取得できなければ "unknown"。
 */
export function clientIpFromForwardedFor(xff: string | null): string {
  const parts = (xff ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : "unknown";
}

// 上限到達時にマップのサイズを抑える（期限切れ掃除→なお超過なら最古を1件削除）。
function evictIfNeeded(now: number) {
  if (hits.size < MAX_KEYS) return;
  for (const [k, e] of hits) {
    if (e.reset < now) hits.delete(k);
  }
  if (hits.size >= MAX_KEYS) {
    const oldest = hits.keys().next().value;
    if (oldest !== undefined) hits.delete(oldest);
  }
}

/**
 * key が windowMs の間に max 回を超えたら false（=拒否）。
 * 公開フォームのスパム/メールコスト DoS を best-effort で抑止する。
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const e = hits.get(key);
  if (e && e.reset >= now) {
    if (e.count >= max) return false;
    e.count++;
    return true;
  }
  // 新規ウィンドウ（未登録 or 期限切れ）。登録前にメモリ上限を点検。
  evictIfNeeded(now);
  hits.set(key, { count: 1, reset: now + windowMs });
  return true;
}
