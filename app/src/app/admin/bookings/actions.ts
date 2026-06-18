"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number];

export async function setBookingStatus(
  id: string,
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session) return;
  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as Status)) return;
  await prisma.booking.update({
    where: { id },
    data: { status: status as Status },
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

export async function setBookingNote(
  id: string,
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session) return;
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  await prisma.booking.update({
    where: { id },
    data: { adminNote: adminNote || null },
  });
  revalidatePath("/admin/bookings");
}
