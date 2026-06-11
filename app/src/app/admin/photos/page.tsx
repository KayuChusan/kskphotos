import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PhotoUploadForm } from "./photo-upload-form";
import { PhotoTable } from "./photo-table";

export const metadata: Metadata = {
  title: "Photos - Admin",
};

export default async function AdminPhotosPage() {
  const [photos, collections] = await Promise.all([
    prisma.photo.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.collection.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Photos</h1>
          <p className="text-sm text-muted-foreground">
            {photos.length} photos total
          </p>
        </div>
        <PhotoUploadForm collections={collections} />
      </div>
      <PhotoTable photos={photos} collections={collections} />
    </div>
  );
}
