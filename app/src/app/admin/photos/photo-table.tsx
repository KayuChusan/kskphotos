"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Eye, EyeOff, Star, StarOff, Sparkles } from "lucide-react";
import { updatePhoto, deletePhoto } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { Photo, Collection } from "@/generated/prisma/client";

export function PhotoTable({
  photos,
  collections,
}: {
  photos: Photo[];
  collections: Collection[];
}) {
  if (photos.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">
          No photos yet. Upload your first photo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {photos.map((photo) => (
        <PhotoRow key={photo.id} photo={photo} collections={collections} />
      ))}
    </div>
  );
}

function PhotoRow({
  photo,
  collections,
}: {
  photo: Photo;
  collections: Collection[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function toggleField(
    field: "isPublished" | "isPortfolio" | "isHero"
  ) {
    const result = await updatePhoto(photo.id, { [field]: !photo[field] });
    if (!result.ok) alert(result.error);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${photo.title}"?`)) return;
    setDeleting(true);
    const result = await deletePhoto(photo.id);
    if (!result.ok) {
      alert(result.error);
      setDeleting(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border p-3">
      {/* Thumbnail */}
      <div className="relative size-16 shrink-0 overflow-hidden rounded bg-muted">
        {photo.imageUrl.startsWith("/") ? (
          <Image
            src={photo.imageUrl}
            alt={photo.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="size-full bg-muted-foreground/10" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{photo.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {photo.category}
          </Badge>
          {photo.lensModel && (
            <span className="text-[11px] text-muted-foreground">
              {photo.lensModel}
            </span>
          )}
          {photo.beforeUrl && (
            <Badge variant="outline" className="text-[10px]">
              B/A
            </Badge>
          )}
        </div>
      </div>

      {/* Collection */}
      <select
        value={photo.collectionId ?? ""}
        onChange={async (e) => {
          const result = await updatePhoto(photo.id, {
            collectionId: e.target.value || null,
          });
          if (!result.ok) alert(result.error);
          router.refresh();
        }}
        className="h-8 max-w-[160px] shrink-0 rounded-md border bg-background px-2 text-xs text-muted-foreground"
        title="Collection"
      >
        <option value="">No collection</option>
        {collections.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      {/* Toggles */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5" title="Published">
          {photo.isPublished ? (
            <Eye className="size-3.5 text-muted-foreground" />
          ) : (
            <EyeOff className="size-3.5 text-muted-foreground" />
          )}
          <Switch
            checked={photo.isPublished}
            onCheckedChange={() => toggleField("isPublished")}
          />
        </div>

        <div className="flex items-center gap-1.5" title="Portfolio">
          {photo.isPortfolio ? (
            <Star className="size-3.5 text-yellow-500" />
          ) : (
            <StarOff className="size-3.5 text-muted-foreground" />
          )}
          <Switch
            checked={photo.isPortfolio}
            onCheckedChange={() => toggleField("isPortfolio")}
          />
        </div>

        <div
          className="flex items-center gap-1.5"
          title="Hero（トップのヒーロー候補）"
        >
          <Sparkles
            className={
              photo.isHero
                ? "size-3.5 text-safelight"
                : "size-3.5 text-muted-foreground"
            }
          />
          <Switch
            checked={photo.isHero}
            onCheckedChange={() => toggleField("isHero")}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
