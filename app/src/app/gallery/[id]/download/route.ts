import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isCollectionUnlocked } from "@/lib/unlock-server";
import { getOriginalSignedUrl, readOriginal } from "@/lib/storage";

// 解錠状態(Cookie)をリクエストごとに評価するため動的
export const dynamic = "force-dynamic";

/**
 * 会員向け高画素(4096px)ダウンロード。
 * 会員限定コレクションが解錠済みのときだけ配信する（メンバー特典）。
 * 公開コレクションの写真や未解錠は 404/403（原本 URL を一切露出しない）。
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { collection: true },
  });
  if (!photo || !photo.isPublished || !photo.originalUrl) {
    return new NextResponse(null, { status: 404 });
  }

  // 高画素 DL は会員限定コレクション(isLocked)のみの特典
  const gated = photo.collection?.isLocked ?? false;
  if (!gated) return new NextResponse(null, { status: 404 });

  const unlocked = photo.collectionId
    ? await isCollectionUnlocked(photo.collectionId)
    : false;
  if (!unlocked) {
    return new NextResponse("会員限定です。note の解錠リンクをご利用ください。", {
      status: 403,
    });
  }

  const downloadName = `${photo.slug}.jpg`;

  // 本番: GCS の短期署名 URL へリダイレクト（転送は GCS が直接負担）
  const signed = await getOriginalSignedUrl(photo.originalUrl, downloadName);
  if (signed) {
    return NextResponse.redirect(signed, {
      status: 302,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  // 開発フォールバック: ローカルから直接ストリーム
  const buf = await readOriginal(photo.originalUrl);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="${downloadName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
