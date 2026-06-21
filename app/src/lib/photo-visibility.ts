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
 * 閲覧者(member=有効な解錠トークンを持つ人)に応じて写真を整形する。EXIF（撮影設定）は
 * 全写真で会員限定なので、非会員には `redactShootingMeta` で撮影設定を伏せる。
 * さらに会員限定コレクションの写真は、非会員には本画像もマスク（`maskPhotoImage`）。
 * 地図用の位置情報(latitude/longitude/location)は公開のまま残す（撮影データ集計も公開）。
 * 会員はそのまま全部見える。`masked` は本画像をマスクしたかのフラグ。
 */
export function maskForViewer<T extends WithLock>(
  photo: T,
  member: boolean
): T & { masked: boolean } {
  if (member) return { ...photo, masked: false };
  if (photo.collection?.isLocked) {
    return { ...maskPhotoImage(photo), masked: true };
  }
  // 公開コレクションの写真：画像と位置情報は出し、撮影設定だけ伏せる
  return { ...redactShootingMeta(photo), masked: false };
}

/**
 * 非会員向けに「撮影設定」だけを伏せる（カメラ/レンズ/F値/SS/ISO/WB/測光/撮影日/
 * 現像レシピ/高画素キー）。地図ギャラリーと撮影データ(集計)は公開維持の方針のため、
 * 位置情報(latitude/longitude/location)は残す。
 */
export function redactShootingMeta<T extends Photo>(photo: T): T {
  return {
    ...photo,
    // ビフォーアフター(現像過程)も会員限定のため before 画像 URL は出さない
    beforeUrl: null,
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
    developNotes: null,
  };
}

/**
 * 会員限定コレクションの写真を完全に伏せる（撮影設定＋位置情報）。`maskPhotoImage`
 * が本画像とあわせて使う。マスク済み写真は地図にも出さない。
 */
export function redactPhotoMeta<T extends Photo>(photo: T): T {
  return {
    ...redactShootingMeta(photo),
    latitude: null,
    longitude: null,
    location: null,
  };
}
