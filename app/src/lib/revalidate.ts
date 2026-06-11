import { revalidatePath } from "next/cache";

/** 写真が表示される公開ページをまとめて再生成（オンデマンド ISR） */
export function revalidatePhotoPages(photoId?: string) {
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/dashboard");
  revalidateCollectionPages();
  if (photoId) {
    revalidatePath(`/gallery/${photoId}`);
    revalidatePath(`/gallery/${photoId}/compare`);
  }
}

/** コレクション一覧・全詳細ページを再生成 */
export function revalidateCollectionPages() {
  revalidatePath("/collections");
  revalidatePath("/collections/[slug]", "page");
}
