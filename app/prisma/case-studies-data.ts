import type { PrismaClient } from "../src/generated/prisma/client";

// 実績（案件ログ）の初期データ。掲載は本人の許可が前提のため、初期は匿名表記で投入する。
// 許可が取れたら管理画面 /admin/case-studies で実名・リンク・サムネに更新する。
export const CASE_STUDIES = [
  {
    id: "seed-case-kanagawa-kengi-web",
    // カレンダー日付として UTC 真夜中で保存（表示/編集も UTC で扱い日付ズレを防ぐ）
    date: new Date("2026-06-26"),
    type: "WEB" as const,
    title: "神奈川県議会議員選挙に立候補予定の候補者のホームページを制作しました。",
    detail: null as string | null,
    thumbnailUrl: null as string | null,
    linkUrl: null as string | null,
    linkLabel: null as string | null,
    isPublished: true,
    sortOrder: 1,
  },
];

/**
 * 実績を投入する。既定(createOnly)は「無ければ作成、有れば触らない」で
 * 管理画面の編集（実名化・リンク追加等）を上書きしない。
 */
export async function seedCaseStudies(
  prisma: PrismaClient,
  { overwrite = false }: { overwrite?: boolean } = {}
) {
  for (const c of CASE_STUDIES) {
    await prisma.caseStudy.upsert({
      where: { id: c.id },
      update: overwrite ? c : {},
      create: c,
    });
  }
}
