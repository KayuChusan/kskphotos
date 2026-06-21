"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VARIANT_WIDTHS } from "@/lib/images";
import { revalidatePhotoPages } from "@/lib/revalidate";
import { deleteFile, deleteOriginal } from "@/lib/storage";
import { createPhotoFromFormData } from "@/lib/photo-create";

export type ActionResult = { ok: true } | { ok: false; error: string };

const updatePhotoSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).nullable(),
    developNotes: z.string().trim().max(4000).nullable(),
    location: z.string().trim().max(200).nullable(),
    collectionId: z.string().nullable(),
    isPublished: z.boolean(),
    isPortfolio: z.boolean(),
    isHero: z.boolean(),
    isLocked: z.boolean(),
    sortOrder: z.number().int(),
  })
  .partial();

export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;

/** フルサイズ JPEG + 事前生成 WebP バリアントをまとめて削除 */
async function deleteImageSet(imageUrl: string) {
  await deleteFile(imageUrl);
  const base = imageUrl.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  for (const w of VARIANT_WIDTHS) {
    await deleteFile(`${base}-w${w}.webp`);
  }
}

/**
 * 写真アップロード。実体は lib/photo-create に委譲（Route Handler と共有）。
 * 本番では UI から Route Handler(/api/admin/photos) を使うが、互換のため残す。
 */
export async function createPhoto(formData: FormData): Promise<ActionResult> {
  return createPhotoFromFormData(formData);
}

export async function updatePhoto(
  id: string,
  input: UpdatePhotoInput
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };

  const parsed = updatePhotoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    await prisma.photo.update({ where: { id }, data: parsed.data });
    revalidatePhotoPages(id);
    revalidatePath("/admin/photos");
    return { ok: true };
  } catch (err) {
    console.error("updatePhoto error:", err);
    return { ok: false, error: "Update failed" };
  }
}

export async function deletePhoto(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };

  try {
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) return { ok: false, error: "Not found" };

    await deleteImageSet(photo.imageUrl);
    if (photo.beforeUrl) await deleteImageSet(photo.beforeUrl);
    if (photo.thumbnailUrl) await deleteFile(photo.thumbnailUrl);
    if (photo.originalUrl) await deleteOriginal(photo.originalUrl);

    await prisma.photo.delete({ where: { id } });

    revalidatePhotoPages(id);
    revalidatePath("/admin/photos");
    return { ok: true };
  } catch (err) {
    console.error("deletePhoto error:", err);
    return { ok: false, error: "Delete failed" };
  }
}
