"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, MapPin } from "lucide-react";
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

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [category, setCategory] = useState<PhotoCategory | "ALL">("ALL");
  const [view, setView] = useState<"grid" | "map">("grid");

  const filtered =
    category === "ALL"
      ? photos
      : photos.filter((p) => p.category === category);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category filter */}
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

        <div className="flex gap-1 border p-1">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("grid")}
            className="h-7 rounded-none px-2"
          >
            <Grid3X3 className="size-4" />
          </Button>
          <Button
            variant={view === "map" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("map")}
            className="h-7 rounded-none px-2"
          >
            <MapPin className="size-4" />
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="columns-1 gap-6 sm:columns-2 md:columns-3 xl:columns-4"
          >
            {filtered.map((photo, i) => (
              <PhotoCard key={photo.id} photo={photo} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <PhotoMap photos={filtered} />
      )}

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No photos in this category yet.
        </p>
      )}
    </div>
  );
}
