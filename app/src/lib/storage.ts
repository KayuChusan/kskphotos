import { writeFile, mkdir, unlink, readFile } from "fs/promises";
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

/**
 * 高画素オリジナルの非公開バケット。公開バケット(photos)は allUsers 読み取りが
 * 付いているため、解錠ゲートを効かせるには別の非公開バケットに保存し、
 * 解錠後の署名 URL でのみ配信する。
 */
const originalsBucketName = process.env.GCS_ORIGINALS_BUCKET;
// 開発フォールバックの保存先。Next が配信する public/ の外に置くこと
// （public 配下だと /originals/<file> で直接配信され解錠ゲートを迂回されるため）。
const ORIGINALS_DIR = path.join(process.cwd(), ".local-originals");
const ORIGINALS_PREFIX = "originals";
const SIGNED_URL_TTL_MS = 5 * 60 * 1000;

let storageClient: Storage | null = null;

function client() {
  // Cloud Run では ADC(サービスアカウント)で認証される
  storageClient ??= new Storage();
  return storageClient;
}

function bucket() {
  return client().bucket(bucketName!);
}

function originalsBucket() {
  return client().bucket(originalsBucketName!);
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

/**
 * 高画素オリジナルを非公開バケットへ保存する。戻り値は保存キー(ファイル名)で、
 * これを Photo.originalUrl に格納する（公開 URL ではない）。
 */
export async function saveOriginal(
  buffer: Buffer,
  filename: string
): Promise<string> {
  if (originalsBucketName) {
    await originalsBucket()
      .file(`${ORIGINALS_PREFIX}/${filename}`)
      .save(buffer, {
        resumable: false,
        contentType: contentTypeFor(filename),
        metadata: { cacheControl: "private, max-age=0, no-store" },
      });
  } else {
    await mkdir(ORIGINALS_DIR, { recursive: true });
    await writeFile(path.join(ORIGINALS_DIR, filename), buffer);
  }
  return filename;
}

/** 高画素オリジナルを削除する（写真削除時）。 */
export async function deleteOriginal(key: string): Promise<void> {
  if (!key) return;
  const filename = path.basename(key);
  if (originalsBucketName) {
    try {
      await originalsBucket().file(`${ORIGINALS_PREFIX}/${filename}`).delete();
    } catch {
      // object may already be deleted
    }
  } else {
    try {
      await unlink(path.join(ORIGINALS_DIR, filename));
    } catch {
      // file may already be deleted
    }
  }
}

/**
 * 解錠後の高画素ダウンロード用 URL を返す。
 * 本番(GCS)は短期(5分)の V4 署名 URL を発行（転送は GCS が直接負担）。
 * 開発(ローカル)は署名 URL を作れないため null を返し、ルートが直接ストリームする。
 */
export async function getOriginalSignedUrl(
  key: string,
  downloadName: string
): Promise<string | null> {
  if (!originalsBucketName) return null;
  const filename = path.basename(key);
  const [url] = await originalsBucket()
    .file(`${ORIGINALS_PREFIX}/${filename}`)
    .getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + SIGNED_URL_TTL_MS,
      responseDisposition: `attachment; filename="${downloadName}"`,
    });
  return url;
}

/** 開発フォールバック：高画素オリジナルのバイト列を読み出す。 */
export async function readOriginal(key: string): Promise<Buffer> {
  const filename = path.basename(key);
  if (originalsBucketName) {
    const [buf] = await originalsBucket()
      .file(`${ORIGINALS_PREFIX}/${filename}`)
      .download();
    return buf;
  }
  return readFile(path.join(ORIGINALS_DIR, filename));
}

/**
 * 公開画像（通常画素 2560px）のバイト列を読み出す。本番は「イメージに焼き込まれた
 * 静的ファイル(public/uploads)」と「ビルド後に GCS へ上げた分」が混在するため、
 * ローカルの public/uploads を優先し、無ければ GCS から取得する。
 */
export async function readImage(url: string): Promise<Buffer> {
  const filename = path.basename(url);
  try {
    return await readFile(path.join(UPLOAD_DIR, filename));
  } catch {
    // 焼き込み静的に無ければ GCS を見る
  }
  if (bucketName) {
    const [buf] = await bucket().file(`${GCS_PREFIX}/${filename}`).download();
    return buf;
  }
  throw new Error(`image not found: ${filename}`);
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
