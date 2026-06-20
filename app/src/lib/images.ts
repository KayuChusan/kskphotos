import sharp from "sharp";

const FULL_MAX_WIDTH = 2560;
const BLUR_WIDTH = 16;
/** 会員向け高画素ダウンロード用の最大幅。公開配信(2560)より大きい。 */
const ORIGINAL_MAX_WIDTH = 4096;

/**
 * 配信用バリアント幅。next/image のカスタムローダー
 * (src/lib/image-loader.ts) と必ず一致させること。
 */
export const VARIANT_WIDTHS = [400, 800, 1600, 2560] as const;

export interface ImageVariant {
  width: number;
  buffer: Buffer;
}

export interface ProcessedImage {
  full: Buffer;
  variants: ImageVariant[];
  blurDataUrl: string;
  width: number;
  height: number;
}

/**
 * アップロード画像の最適化パイプライン。
 * EXIF Orientation を物理回転に反映した上で、
 * フルサイズ JPEG・配信用 WebP バリアント・blur プレースホルダーを
 * すべてアップロード時に事前生成する（実行時の画像最適化を不要にする）。
 */
export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  const base = sharp(buffer).rotate();

  const full = await base
    .clone()
    .resize(FULL_MAX_WIDTH, FULL_MAX_WIDTH, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  const { width = 0, height = 0 } = await sharp(full).metadata();

  const variants = await Promise.all(
    VARIANT_WIDTHS.map(async (w) => ({
      width: w,
      buffer: await base
        .clone()
        .resize(w, w, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer(),
    }))
  );

  const blurBuffer = await base
    .clone()
    .resize(BLUR_WIDTH)
    .webp({ quality: 30 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  return { full, variants, blurDataUrl, width, height };
}

/**
 * 会員向け高画素ダウンロード用の JPEG を生成する（4096px・高品質）。
 * 公開配信の 2560px より大きく、原寸より大きくはしない（withoutEnlargement）。
 * 非公開バケットに保存し、解錠後の署名 URL でのみ配信する。
 */
export async function processOriginal(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(ORIGINAL_MAX_WIDTH, ORIGINAL_MAX_WIDTH, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
}
