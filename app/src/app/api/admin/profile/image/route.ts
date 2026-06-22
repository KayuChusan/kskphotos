import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { processAvatar } from "@/lib/images";
import { saveFile } from "@/lib/storage";
import { upsertProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * プロフィール写真のアップロード。写真アップロードと同様、Server Action の
 * multipart 解析が Cloud Run で失敗するため Route Handler の req.formData() で受ける。
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "アップロードの受信に失敗しました" },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json(
      { ok: false, error: "画像を選択してください" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { jpeg, blurDataUrl } = await processAvatar(buffer);
    const url = await saveFile(jpeg, `profile-${Date.now()}.jpg`);
    await upsertProfile({ profileImage: url, profileBlur: blurDataUrl });
    revalidatePath("/about");
    revalidatePath("/admin/profile");
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("profile image upload error:", err);
    return NextResponse.json(
      { ok: false, error: "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}
