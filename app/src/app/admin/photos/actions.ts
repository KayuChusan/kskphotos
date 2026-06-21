"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractExif, isRawFile, extractPreviewJpeg } from "@/lib/exif";
import { processImage, processOriginal, VARIANT_WIDTHS } from "@/lib/images";
import { revalidatePhotoPages } from "@/lib/revalidate";
import {
  saveFile,
  deleteFile,
  saveOriginal,
  deleteOriginal,
} from "@/lib/storage";

export type ActionResult = { ok: true } | { ok: false; error: string };

const createPhotoSchema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です").max(200),
  category: z.enum([
    "PORTRAIT",
    "LANDSCAPE",
    "EVENT",
    "STREET",
    "ARCHITECTURE",
    "FOOD",
    "OTHER",
  ]),
  description: z.string().trim().max(2000).optional(),
  developNotes: z.string().trim().max(4000).optional(),
  location: z.string().trim().max(200).optional(),
  collectionId: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  tags: z
    .string()
    .optional()
    .transform((s) =>
      (s ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    ),
  isPublished: z.stringbool().default(true),
  isPortfolio: z.stringbool().default(false),
  isHero: z.stringbool().default(false),
});

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/** バリアント一式を保存し、URL（フルサイズ JPEG）を返す */
async function saveProcessed(
  processed: Awaited<ReturnType<typeof processImage>>,
  baseName: string
): Promise<{ imageUrl: string; thumbnailUrl: string }> {
  const imageUrl = await saveFile(processed.full, `${baseName}.jpg`);
  for (const v of processed.variants) {
    await saveFile(v.buffer, `${baseName}-w${v.width}.webp`);
  }
  return { imageUrl, thumbnailUrl: `/uploads/${baseName}-w800.webp` };
}

/** フルサイズ JPEG + 事前生成 WebP バリアントをまとめて削除 */
async function deleteImageSet(imageUrl: string) {
  await deleteFile(imageUrl);
  const base = imageUrl.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  for (const w of VARIANT_WIDTHS) {
    await deleteFile(`${base}-w${w}.webp`);
  }
}

export async function createPhoto(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };

  try {
    const parsed = createPhotoSchema.safeParse({
      title: formData.get("title"),
      category: formData.get("category"),
      description: formData.get("description") || undefined,
      developNotes: formData.get("developNotes") || undefined,
      location: formData.get("location") || undefined,
      tags: formData.get("tags") || undefined,
      isPublished: formData.get("isPublished") ?? undefined,
      isPortfolio: formData.get("isPortfolio") ?? undefined,
      isHero: formData.get("isHero") ?? undefined,
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }
    const data = parsed.data;

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { ok: false, error: "写真ファイルを選択してください" };
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const slug = slugify(data.title);

    let sourceBuffer: Buffer = rawBuffer;
    if (isRawFile(file.name)) {
      const preview = await extractPreviewJpeg(rawBuffer);
      if (!preview) {
        return {
          ok: false,
          error: "RAW プレビューの抽出に失敗しました。JPEG を使用してください",
        };
      }
      sourceBuffer = preview;
    }

    const processed = await processImage(sourceBuffer);
    const { imageUrl, thumbnailUrl } = await saveProcessed(
      processed,
      `${timestamp}-${slug}`
    );

    // 会員向け高画素オリジナル(4096px)を非公開バケットへ保存
    const original = await processOriginal(sourceBuffer);
    const originalUrl = await saveOriginal(
      original,
      `${timestamp}-${slug}-original.jpg`
    );

    let beforeUrl: string | undefined;
    const beforeFile = formData.get("beforeFile") as File | null;
    if (beforeFile && beforeFile.size > 0) {
      const beforeBuffer = Buffer.from(await beforeFile.arrayBuffer());
      let beforeSource: Buffer | null = beforeBuffer;
      if (isRawFile(beforeFile.name)) {
        beforeSource = await extractPreviewJpeg(beforeBuffer);
      }
      if (beforeSource) {
        const beforeProcessed = await processImage(beforeSource);
        ({ imageUrl: beforeUrl } = await saveProcessed(
          beforeProcessed,
          `${timestamp}-${slug}-before`
        ));
      }
    }

    // EXIF はオリジナル（RAW なら RAW 本体）から抽出
    const exif = await extractExif(rawBuffer);
    // 寸法は sharp の処理結果（Orientation 反映済み）を優先
    exif.imageWidth = processed.width || exif.imageWidth;
    exif.imageHeight = processed.height || exif.imageHeight;

    const photo = await prisma.photo.create({
      data: {
        title: data.title,
        description: data.description,
        developNotes: data.developNotes,
        slug: `${slug}-${timestamp}`,
        imageUrl,
        beforeUrl,
        thumbnailUrl,
        originalUrl,
        blurDataUrl: processed.blurDataUrl,
        category: data.category,
        tags: data.tags,
        location: data.location,
        collectionId: data.collectionId,
        isPortfolio: data.isPortfolio,
        isPublished: data.isPublished,
        isHero: data.isHero,
        ...exif,
      },
    });

    revalidatePhotoPages(photo.id);
    revalidatePath("/admin/photos");

    return { ok: true };
  } catch (err) {
    console.error("createPhoto error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Upload failed",
    };
  }
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
