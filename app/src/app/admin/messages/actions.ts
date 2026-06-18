"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function setMessageRead(
  id: string,
  isRead: boolean
): Promise<void> {
  const session = await auth();
  if (!session) return;
  await prisma.contactMessage.update({ where: { id }, data: { isRead } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function deleteMessage(id: string): Promise<void> {
  const session = await auth();
  if (!session) return;
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
