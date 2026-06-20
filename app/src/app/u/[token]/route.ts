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
 * 会員解錠リンク。note の限定記事に貼った /u/<token> を踏むと、
 * 対象コレクションを解錠した署名 Cookie を発行し、コレクションへリダイレクトする。
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const origin = req.nextUrl.origin;

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
