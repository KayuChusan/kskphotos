import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPhotoFromFormData } from "@/lib/photo-create";

// アップロードはリクエストごとに処理（解錠/認証 Cookie を読む）
export const dynamic = "force-dynamic";
// 画像処理に時間がかかるため最大に
export const maxDuration = 300;

/**
 * 写真アップロード。Server Action の multipart 解析が Cloud Run 本番で
 * 「Unexpected end of form」になるため、Route Handler の req.formData() で受ける。
 * （Cloud Run のリクエスト上限 32MB の範囲で動作）
 */
export async function POST(req: Request) {
  // ボディ（大きな画像）を読む前に認証（未認証によるリソース消費を防ぐ）
  const session = await auth();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "アップロードの受信に失敗しました（サイズが大きすぎる可能性があります）" },
      { status: 400 }
    );
  }

  const result = await createPhotoFromFormData(formData);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
