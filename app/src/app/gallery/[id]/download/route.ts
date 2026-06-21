import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isMember } from "@/lib/unlock-server";
import { getOriginalSignedUrl, readOriginal, readImage } from "@/lib/storage";

// 解錠状態(Cookie)をリクエストごとに評価するため動的
export const dynamic = "force-dynamic";

/**
 * 写真ダウンロード。
 * - 既定（高画素 4096px）：会員のみ。非会員・原本なしは 403/404。
 * - `?res=standard`（通常画素 2560px）：画像が見られる人（公開写真 or 会員）。
 * いずれも短期署名 URL（attachment）へリダイレクトして「保存」を強制（開発はストリーム）。
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const standard = new URL(req.url).searchParams.get("res") === "standard";

  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { collection: { select: { isLocked: true } } },
  });
  if (!photo || !photo.isPublished) {
    return new NextResponse(null, { status: 404 });
  }

  const member = await isMember();
  const lockedCollection = photo.collection?.isLocked ?? false;

  if (standard) {
    // 通常画素：画像が見られる人のみ（会員限定コレクションは非会員に出さない）
    if (lockedCollection && !member) {
      return new NextResponse("会員限定です。", { status: 403 });
    }
    // アップロード画像でない場合（seed の外部URL等）はそのまま遷移
    if (!photo.imageUrl.startsWith("/uploads/")) {
      return NextResponse.redirect(photo.imageUrl, { status: 302 });
    }
    // 焼き込み静的/GCS どちらでも確実に保存させるためストリーム配信
    const downloadName = `${photo.slug}-2560.jpg`;
    const buf = await readImage(photo.imageUrl);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  // 高画素：会員のみ
  if (!photo.originalUrl) return new NextResponse(null, { status: 404 });
  if (!member) {
    return new NextResponse("会員限定です。note の解錠リンクをご利用ください。", {
      status: 403,
    });
  }

  const downloadName = `${photo.slug}.jpg`;
  const signed = await getOriginalSignedUrl(photo.originalUrl, downloadName);
  if (signed) {
    return NextResponse.redirect(signed, {
      status: 302,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  const buf = await readOriginal(photo.originalUrl);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="${downloadName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
