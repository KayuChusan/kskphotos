import type { Photo, Prisma } from "@/generated/prisma/client";

/**
 * マスク対象（会員限定 × ロック写真 × 未解錠）の写真から、本画像 URL を取り除く。
 * EXIF も伏せ、表示用には blurDataUrl と寸法（アスペクト比）だけ残す。
 * クライアントへ渡る RSC ペイロードに本画像 URL を出さないための関数。
 */
export function maskPhotoImage<T extends Photo>(photo: T): T {
  return {
    ...redactPhotoMeta(photo),
    imageUrl: "",
    thumbnailUrl: null,
    beforeUrl: null,
  };
}

/**
 * 公開一覧で、会員限定（ロック中）コレクションの写真を除外する where 断片。
 * トップ・/dashboard・sitemap で使用（トップは会員写真を出さない方針、dashboard は
 * EXIF 集計のため未解錠の会員写真を含めると EXIF が漏れる、sitemap は detail が noindex）。
 * /gallery・/works・/collections では除外せず、未解錠ならモザイク表示する（maskForViewer）。
 */
export const excludeLockedPhotos = {
  OR: [{ collectionId: null }, { collection: { isLocked: false } }],
} satisfies Prisma.PhotoWhereInput;

/** 一覧表示用に最小限の所属情報を持つ写真型（collection.isLocked で会員限定を判定）。 */
type WithLock = Photo & { collection?: { isLocked: boolean } | null };

/**
 * 公開一覧（/gallery・/works・/collections）で、写真が「未解錠の会員限定コレクション」に
 * 属するかを判定し、属する場合はマスク（本画像・EXIF を除去）して `masked` フラグを付ける。
 * 解錠済みコレクション・公開コレクション・未所属はそのまま返す。
 */
export function maskForViewer<T extends WithLock>(
  photo: T,
  unlockedIds: Set<string>
): T & { masked: boolean } {
  const masked =
    !!photo.collection?.isLocked &&
    !(photo.collectionId != null && unlockedIds.has(photo.collectionId));
  return masked
    ? { ...maskPhotoImage(photo), masked }
    : { ...photo, masked };
}

/**
 * 会員限定コレクションが未解錠のとき、写真から EXIF・現像レシピ・位置情報を伏せる。
 * 画像そのものは表示する（マスクは Phase 2）。一覧カード・詳細・OGP/説明文の
 * いずれからも漏れないよう、表示前にこの関数を通す。
 */
export function redactPhotoMeta<T extends Photo>(photo: T): T {
  return {
    ...photo,
    originalUrl: null,
    cameraModel: null,
    lensMake: null,
    lensModel: null,
    focalLength: null,
    aperture: null,
    shutterSpeed: null,
    iso: null,
    dateTaken: null,
    whiteBalance: null,
    meteringMode: null,
    latitude: null,
    longitude: null,
    location: null,
    developNotes: null,
  };
}
