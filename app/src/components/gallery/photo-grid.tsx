"use client";

import { useMemo, useState } from "react";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, MapPin, Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoMap } from "@/components/gallery/photo-map";
import { LockedTile } from "@/components/gallery/locked-tile";
import { cn } from "@/lib/utils";
import type { Photo, PhotoCategory } from "@/generated/prisma/client";

const CATEGORY_LABELS: Record<PhotoCategory | "ALL", string> = {
  ALL: "All",
  PORTRAIT: "Portrait",
  LANDSCAPE: "Landscape",
  EVENT: "Event",
  STREET: "Street",
  ARCHITECTURE: "Architecture",
  FOOD: "Food",
  OTHER: "Other",
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as (PhotoCategory | "ALL")[];

function formatExif(photo: Photo): string {
  const parts = [
    photo.focalLength ? `${photo.focalLength}mm` : null,
    photo.aperture ? `f/${photo.aperture}` : null,
    photo.shutterSpeed ? `${photo.shutterSpeed}s` : null,
    photo.iso ? `ISO ${photo.iso}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

/** コンタクトシート風フォトカード — 画像 + モノスペースのキャプション行 */
export function PhotoCard({
  photo,
  index = 0,
  masked = false,
}: {
  photo: Photo;
  index?: number;
  masked?: boolean;
}) {
  const exif = masked ? "" : formatExif(photo);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: "easeOut" }}
      className="mb-6 break-inside-avoid"
    >
      <Link href={`/gallery/${photo.id}`} className="group block">
        {masked ? (
          <LockedTile
            blurDataUrl={photo.blurDataUrl}
            width={photo.imageWidth}
            height={photo.imageHeight}
            className="viewfinder"
          />
        ) : (
          <div className="viewfinder develop relative overflow-hidden">
            <Image
              src={photo.thumbnailUrl ?? photo.imageUrl}
              alt={photo.title}
              width={photo.imageWidth ?? 1200}
              height={photo.imageHeight ?? 800}
              placeholder={photo.blurDataUrl ? "blur" : "empty"}
              blurDataURL={photo.blurDataUrl ?? undefined}
              className="h-auto w-full transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-110"
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              style={{ viewTransitionName: `photo-${photo.id}` }}
            />
          </div>
        )}

        {/* Caption strip — フィルムの縁コードのように */}
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <p className="truncate font-heading text-base text-foreground/90">
            {photo.title}
          </p>
          <p
            className={cn(
              "shrink-0 text-muted-foreground",
              masked ? "text-xs" : "exif-text"
            )}
          >
            {masked ? (
              "会員限定"
            ) : (
              <>
                {CATEGORY_LABELS[photo.category]}
                {photo.beforeUrl && (
                  <span className="text-safelight"> · RAW</span>
                )}
              </>
            )}
          </p>
        </div>
        {exif && (
          <p className="exif-text mt-0.5 text-muted-foreground/60">{exif}</p>
        )}
      </Link>
    </motion.div>
  );
}

type GalleryPhoto = Photo & {
  masked?: boolean;
  collection?: { title: string; isLocked: boolean } | null;
};

export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [category, setCategory] = useState<PhotoCategory | "ALL">("ALL");
  const [collectionId, setCollectionId] = useState<string>("ALL");
  const [hideLocked, setHideLocked] = useState(false); // 既定は全表示
  const [view, setView] = useState<"grid" | "map">("grid");

  // 写真から実在するシリーズ（コレクション）を抽出
  const collections = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of photos) {
      if (p.collectionId && p.collection?.title) {
        map.set(p.collectionId, p.collection.title);
      }
    }
    return Array.from(map, ([id, title]) => ({ id, title }));
  }, [photos]);

  const hasLocked = useMemo(
    () => photos.some((p) => p.collection?.isLocked),
    [photos]
  );

  const filtered = photos.filter((p) => {
    if (category !== "ALL" && p.category !== category) return false;
    if (collectionId !== "ALL" && p.collectionId !== collectionId) return false;
    if (hideLocked && p.collection?.isLocked) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {/* 主フィルター：カテゴリー */}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
              className={cn(
                "exif-text border-b pb-1 outline-none transition-colors focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ring",
                category === cat
                  ? "border-safelight text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* 副フィルター：シリーズ選択・会員限定トグル・表示切替 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex flex-wrap items-center gap-3">
            {collections.length > 0 && (
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                aria-label="シリーズで絞り込み"
                className="h-8 rounded-none border border-border bg-background px-2 text-xs text-muted-foreground outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <option value="ALL">すべてのシリーズ</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            )}

            {hasLocked && (
              <Button
                variant={hideLocked ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setHideLocked((v) => !v)}
                aria-pressed={hideLocked}
                className="h-8 rounded-none px-2.5 text-xs"
              >
                {hideLocked ? (
                  <LockOpen className="size-3.5" />
                ) : (
                  <Lock className="size-3.5" />
                )}
                {hideLocked ? "会員限定を表示" : "会員限定を隠す"}
              </Button>
            )}
          </div>

          <div className="flex gap-1 border p-1">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("grid")}
              aria-label="グリッド表示"
              className="h-7 rounded-none px-2"
            >
              <Grid3X3 className="size-4" />
            </Button>
            <Button
              variant={view === "map" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("map")}
              aria-label="地図表示"
              className="h-7 rounded-none px-2"
            >
              <MapPin className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {view === "grid" ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${collectionId}-${hideLocked}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="columns-1 gap-6 sm:columns-2 md:columns-3 xl:columns-4"
          >
            {filtered.map((photo, i) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                masked={photo.masked}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <PhotoMap photos={filtered} />
      )}

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          条件に合う写真がありません。
        </p>
      )}
    </div>
  );
}
