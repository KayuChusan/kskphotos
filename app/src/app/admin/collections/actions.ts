"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  revalidateCollectionPages,
  revalidatePhotoPages,
} from "@/lib/revalidate";
import { generateToken, hashToken } from "@/lib/unlock";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type CreateTokenResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

const createCollectionSchema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です").max(200),
  description: z.string().trim().max(2000).optional(),
});

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .trim() || "collection"
  );
}

export async function createCollection(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };

  const parsed = createCollectionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    await prisma.collection.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        slug: `${slugify(parsed.data.title)}-${Date.now().toString(36)}`,
      },
    });
    revalidateCollectionPages();
    revalidatePath("/admin/collections");
    return { ok: true };
  } catch (err) {
    console.error("createCollection error:", err);
    return { ok: false, error: "Create failed" };
  }
}

export async function setCollectionLock(
  id: string,
  isLocked: boolean
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };
  try {
    await prisma.collection.update({ where: { id }, data: { isLocked } });
    // ロック切替で公開一覧（/gallery・/works・/dashboard・トップ）の対象写真が変わるため全面再生成
    revalidatePhotoPages();
    revalidatePath("/admin/collections");
    return { ok: true };
  } catch (err) {
    console.error("setCollectionLock error:", err);
    return { ok: false, error: "Update failed" };
  }
}

/** 解錠トークンを発行。平文トークンは戻り値で一度だけ返す（DB はハッシュのみ）。 */
export async function createUnlockToken(
  collectionId: string,
  label?: string
): Promise<CreateTokenResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };
  try {
    const token = generateToken();
    await prisma.unlockToken.create({
      data: {
        collectionId,
        tokenHash: hashToken(token),
        label: label?.trim() || null,
      },
    });
    revalidatePath("/admin/collections");
    return { ok: true, token };
  } catch (err) {
    console.error("createUnlockToken error:", err);
    return { ok: false, error: "Create token failed" };
  }
}

export async function revokeUnlockToken(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };
  try {
    await prisma.unlockToken.update({ where: { id }, data: { revoked: true } });
    revalidatePath("/admin/collections");
    return { ok: true };
  } catch (err) {
    console.error("revokeUnlockToken error:", err);
    return { ok: false, error: "Revoke failed" };
  }
}

export async function deleteCollection(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };

  try {
    // Photo.collectionId は onDelete: SetNull のため写真は残る
    await prisma.collection.delete({ where: { id } });
    revalidateCollectionPages();
    revalidatePath("/admin/collections");
    return { ok: true };
  } catch (err) {
    console.error("deleteCollection error:", err);
    return { ok: false, error: "Delete failed" };
  }
}
