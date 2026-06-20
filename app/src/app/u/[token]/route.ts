import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  UNLOCK_COOKIE,
  hashToken,
  signUnlockValue,
  parseUnlockValue,
  addEntry,
  unlockCookieOptions,
} from "@/lib/unlock";

export const dynamic = "force-dynamic";

/**
 * リダイレクト先の公開オリジンを決める。Cloud Run の背後では
 * req.nextUrl.origin が内部アドレス(0.0.0.0:8080)になるため、本番は
 * 設定済みの公開オリジン(AUTH_URL / NEXT_PUBLIC_SITE_URL)を使う。
 * リクエストヘッダ(Host/X-Forwarded-Host)は信頼しない（オープンリダイレクト防止）。
 * 開発時は未設定なので req.nextUrl.origin(localhost)にフォールバックする。
 */
function publicOrigin(req: NextRequest): string {
  const configured = process.env.AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // 設定値が不正なら既定にフォールバック
    }
  }
  return req.nextUrl.origin;
}

/**
 * 会員解錠リンク。note の限定記事に貼った /u/<token> を踏むと、
 * 対象コレクションを解錠した署名 Cookie を発行し、コレクションへリダイレクトする。
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const origin = publicOrigin(req);

  const record = await prisma.unlockToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { collection: true },
  });

  const valid =
    record &&
    !record.revoked &&
    record.collection != null &&
    (record.expiresAt === null || record.expiresAt > new Date());

  if (!valid || !record || !record.collection) {
    return NextResponse.redirect(new URL("/collections?unlock=invalid", origin));
  }

  const current = parseUnlockValue(req.cookies.get(UNLOCK_COOKIE)?.value);
  const entries = addEntry(current, record.collectionId, record.id);

  const res = NextResponse.redirect(
    new URL(`/collections/${record.collection.slug}?unlocked=1`, origin)
  );
  res.cookies.set(UNLOCK_COOKIE, signUnlockValue(entries), unlockCookieOptions());
  return res;
}
