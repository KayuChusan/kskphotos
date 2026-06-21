import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isMember } from "@/lib/unlock-server";
import { getOriginalSignedUrl, readOriginal } from "@/lib/storage";

// 解錠状態(Cookie)をリクエストごとに評価するため動的
export const dynamic = "force-dynamic";

/**
 * 会員向け高画素(4096px)ダウンロード。会員（有効な解錠トークン保有）のみ配信。
 * 非会員・原本なしは 403/404（原本 URL を一切露出しない）。
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo || !photo.isPublished || !photo.originalUrl) {
    return new NextResponse(null, { status: 404 });
  }

  if (!(await isMember())) {
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
