import type { Photo, Prisma } from "@/generated/prisma/client";

/**
 * 公開一覧（/gallery・/dashboard・トップ・/works・sitemap 等）で、会員限定
 * （ロック中）コレクションの写真を除外する where 断片。会員写真は公開ファイアホースに
 * 出さず、解錠リンク→コレクションページでのみ見せる。collectionId が null の写真は含める。
 */
export const excludeLockedPhotos = {
  OR: [{ collectionId: null }, { collection: { isLocked: false } }],
} satisfies Prisma.PhotoWhereInput;

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
