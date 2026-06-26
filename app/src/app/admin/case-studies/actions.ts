"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ActionResult = { ok: true } | { ok: false; error: string };

const TYPES = ["PHOTO", "WEB", "IT"] as const;

const schema = z.object({
  date: z.coerce.date(),
  type: z.enum(TYPES),
  title: z.string().trim().min(1, "説明は必須です").max(300),
  detail: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => v || null),
  thumbnailUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => v || null),
  linkUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => v || null),
  linkLabel: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((v) => v || null),
  isPublished: z.stringbool().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

function parse(formData: FormData) {
  return schema.safeParse({
    date: formData.get("date"),
    type: formData.get("type"),
    title: formData.get("title"),
    detail: formData.get("detail") || undefined,
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
    linkUrl: formData.get("linkUrl") || undefined,
    linkLabel: formData.get("linkLabel") || undefined,
    isPublished: formData.get("isPublished") ?? undefined,
    sortOrder: formData.get("sortOrder") || undefined,
  });
}

function revalidateWorks() {
  revalidatePath("/works");
  revalidatePath("/admin/case-studies");
}

export async function createCaseStudy(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };
  const parsed = parse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  try {
    await prisma.caseStudy.create({ data: parsed.data });
    revalidateWorks();
    return { ok: true };
  } catch (err) {
    console.error("createCaseStudy error:", err);
    return { ok: false, error: "Create failed" };
  }
}

export async function updateCaseStudy(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };
  const parsed = parse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  try {
    await prisma.caseStudy.update({ where: { id }, data: parsed.data });
    revalidateWorks();
    return { ok: true };
  } catch (err) {
    console.error("updateCaseStudy error:", err);
    return { ok: false, error: "Update failed" };
  }
}

export async function deleteCaseStudy(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };
  try {
    await prisma.caseStudy.delete({ where: { id } });
    revalidateWorks();
    return { ok: true };
  } catch (err) {
    console.error("deleteCaseStudy error:", err);
    return { ok: false, error: "Delete failed" };
  }
}
