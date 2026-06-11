import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { Storage } from "@google-cloud/storage";

/**
 * 画像ストレージ。GCS_BUCKET_NAME が設定されていれば GCS(本番)、
 * なければローカル FS(開発)に保存する。
 * URL はどちらも `/uploads/<filename>` 形式で返す — 本番では
 * イメージに焼き込まれた静的ファイル、なければ /uploads ルートハンドラが
 * GCS へリダイレクトして配信する。
 */
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const GCS_PREFIX = "uploads";

const bucketName = process.env.GCS_BUCKET_NAME;

let storageClient: Storage | null = null;

function bucket() {
  // Cloud Run では ADC(サービスアカウント)で認証される
  storageClient ??= new Storage();
  return storageClient.bucket(bucketName!);
}

function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".webp":
      return "image/webp";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
}

export async function saveFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  if (bucketName) {
    await bucket()
      .file(`${GCS_PREFIX}/${filename}`)
      .save(buffer, {
        resumable: false,
        contentType: contentTypeFor(filename),
        metadata: {
          // ファイル名はタイムスタンプ付きで一意のため immutable 扱いで良い
          cacheControl: "public, max-age=31536000, immutable",
        },
      });
  } else {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  }
  return `/uploads/${filename}`;
}

export async function deleteFile(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  const filename = path.basename(url);
  if (bucketName) {
    try {
      await bucket().file(`${GCS_PREFIX}/${filename}`).delete();
    } catch {
      // object may already be deleted
    }
  } else {
    try {
      await unlink(path.join(UPLOAD_DIR, filename));
    } catch {
      // file may already be deleted
    }
  }
}
