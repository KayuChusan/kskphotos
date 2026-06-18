"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ActionResult = { ok: true } | { ok: false; error: string };

const CATEGORIES = [
  "PORTRAIT",
  "FAMILY",
  "EVENT",
  "COMMERCIAL",
  "LOCATION",
  "POLITICS",
  "WEB_PRODUCTION",
  "IT_SUPPORT",
] as const;

const schema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です").max(200),
  description: z.string().trim().min(1, "説明は必須です").max(2000),
  price: z.coerce.number().int().min(0).max(100_000_000),
  priceNote: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((v) => v || null),
  duration: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => v || null),
  category: z.enum(CATEGORIES),
  features: z
    .string()
    .optional()
    .transform((s) =>
      (s ?? "")
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)
    ),
  isActive: z.stringbool().default(false),
  isPopular: z.stringbool().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

function parse(formData: FormData) {
  return schema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price") || 0,
    priceNote: formData.get("priceNote") || undefined,
    duration: formData.get("duration") || undefined,
    category: formData.get("category"),
    features: formData.get("features") || undefined,
    isActive: formData.get("isActive") ?? undefined,
    isPopular: formData.get("isPopular") ?? undefined,
    sortOrder: formData.get("sortOrder") || undefined,
  });
}

function revalidateServicePages() {
  revalidatePath("/services");
  revalidatePath("/admin/services");
  revalidatePath("/booking");
}

export async function createService(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };
  const parsed = parse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  try {
    await prisma.service.create({ data: parsed.data });
    revalidateServicePages();
    return { ok: true };
  } catch (err) {
    console.error("createService error:", err);
    return { ok: false, error: "Create failed" };
  }
}

export async function updateService(
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
    await prisma.service.update({ where: { id }, data: parsed.data });
    revalidateServicePages();
    return { ok: true };
  } catch (err) {
    console.error("updateService error:", err);
    return { ok: false, error: "Update failed" };
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };
  try {
    // Booking.serviceId は任意リレーション(onDelete: SetNull)のため予約は残る
    await prisma.service.delete({ where: { id } });
    revalidateServicePages();
    return { ok: true };
  } catch (err) {
    console.error("deleteService error:", err);
    return { ok: false, error: "Delete failed" };
  }
}
