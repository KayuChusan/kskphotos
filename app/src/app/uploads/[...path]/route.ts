import { NextResponse } from "next/server";

/**
 * /uploads/* のフォールバック配信。
 * イメージに焼き込まれた静的ファイル (public/uploads) が優先され、
 * ビルド後に管理画面からアップロードされた分だけがここに到達する。
 * GCS の公開 URL へリダイレクトして配信する。
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) return new NextResponse(null, { status: 404 });

  const { path: segments } = await params;
  if (!segments?.length || segments.some((s) => s === "." || s === "..")) {
    return new NextResponse(null, { status: 404 });
  }

  const object = segments.map(encodeURIComponent).join("/");
  return NextResponse.redirect(
    `https://storage.googleapis.com/${bucketName}/uploads/${object}`,
    {
      status: 302,
      headers: { "Cache-Control": "public, max-age=3600" },
    }
  );
}
