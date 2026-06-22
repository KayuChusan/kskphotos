"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { upsertProfile } from "@/lib/profile";

export type ActionResult = { ok: true } | { ok: false; error: string };

const linesToArray = (s: string | undefined) =>
  (s ?? "")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

const schema = z.object({
  name: z.string().trim().max(100),
  tagline: z.string().trim().max(100),
  bio: z.string().trim().max(4000),
  gearBody: z.string().optional().transform(linesToArray),
  gearLenses: z.string().optional().transform(linesToArray),
  gearSoftware: z.string().optional().transform(linesToArray),
  policyBadge: z.string().trim().max(100),
  policy: z.string().trim().max(4000),
});

export async function updateProfile(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };

  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    tagline: formData.get("tagline") ?? "",
    bio: formData.get("bio") ?? "",
    gearBody: formData.get("gearBody") ?? "",
    gearLenses: formData.get("gearLenses") ?? "",
    gearSoftware: formData.get("gearSoftware") ?? "",
    policyBadge: formData.get("policyBadge") ?? "",
    policy: formData.get("policy") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    await upsertProfile(parsed.data);
    revalidatePath("/about");
    revalidatePath("/admin/profile");
    return { ok: true };
  } catch (err) {
    console.error("updateProfile error:", err);
    return { ok: false, error: "保存に失敗しました" };
  }
}
