import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CollectionManager } from "./collection-manager";

export const metadata: Metadata = {
  title: "Collections - Admin",
};

export default async function AdminCollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { photos: true } },
      unlockTokens: { orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Collections</h1>
        <p className="text-sm text-muted-foreground">
          シリーズ単位で写真をまとめます。写真の割当は Photos
          ページの各行から行います
        </p>
      </div>
      <CollectionManager collections={collections} />
    </div>
  );
}
