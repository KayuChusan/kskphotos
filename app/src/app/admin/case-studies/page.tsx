import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  CaseStudiesManager,
  type CaseStudyItem,
} from "./case-studies-manager";

export const metadata: Metadata = {
  title: "実績 - Admin | KSK Works",
};

export default async function AdminCaseStudiesPage() {
  const rows = await prisma.caseStudy.findMany({
    orderBy: [{ date: "desc" }, { sortOrder: "asc" }],
  });
  const items: CaseStudyItem[] = rows.map((c) => ({
    id: c.id,
    date: c.date.toISOString().slice(0, 10),
    type: c.type,
    title: c.title,
    detail: c.detail,
    thumbnailUrl: c.thumbnailUrl,
    linkUrl: c.linkUrl,
    linkLabel: c.linkLabel,
    isPublished: c.isPublished,
    sortOrder: c.sortOrder,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">実績（お仕事の記録）</h1>
        <p className="text-sm text-muted-foreground">
          公開ページ /works のタイムラインに反映されます。掲載は本人の許可が前提です（未許可は「公開する」を外すか匿名表記で）。
        </p>
      </div>
      <CaseStudiesManager items={items} />
    </div>
  );
}
