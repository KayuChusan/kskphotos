import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { UNLOCK_COOKIE, parseUnlockValue } from "./unlock";

/**
 * RSC から解錠状態を読む（読み取り専用）。Cookie のトークンID を DB と突き合わせ、
 * 失効・期限切れトークンはここで除外する（管理画面での失効が即時に効く）。
 */
export async function getUnlockedCollectionIds(): Promise<string[]> {
  const store = await cookies();
  const entries = parseUnlockValue(store.get(UNLOCK_COOKIE)?.value);
  if (entries.length === 0) return [];

  const valid = await prisma.unlockToken.findMany({
    where: {
      id: { in: entries.map((e) => e.k) },
      revoked: false,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { id: true, collectionId: true },
  });
  const validSet = new Set(valid.map((t) => `${t.collectionId}:${t.id}`));

  return entries.filter((e) => validSet.has(`${e.c}:${e.k}`)).map((e) => e.c);
}

export async function isCollectionUnlocked(
  collectionId: string
): Promise<boolean> {
  const ids = await getUnlockedCollectionIds();
  return ids.includes(collectionId);
}
