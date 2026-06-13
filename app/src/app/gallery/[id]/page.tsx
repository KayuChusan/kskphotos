import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { ExifTable } from "@/components/gallery/exif-table";
import { PhotoLightbox } from "@/components/gallery/photo-lightbox";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const photos = await prisma.photo.findMany({
    where: { isPublished: true },
    select: { id: true },
  });
  return photos.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return { title: "Not Found" };
  return {
    title: photo.title,
    description: `${photo.title} — ${photo.lensModel ?? ""} ${photo.aperture ? `f/${photo.aperture}` : ""} ${photo.shutterSpeed ? `${photo.shutterSpeed}s` : ""} ${photo.iso ? `ISO ${photo.iso}` : ""}`.trim(),
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  PORTRAIT: "Portrait",
  LANDSCAPE: "Landscape",
  EVENT: "Event",
  STREET: "Street",
  ARCHITECTURE: "Architecture",
  FOOD: "Food",
  OTHER: "Other",
};

export default async function PhotoDetailPage({ params }: Props) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo || !photo.isPublished) notFound();

  const dateTaken = photo.dateTaken
    ? new Date(photo.dateTaken).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/gallery"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        ギャラリーに戻る
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <PhotoLightbox photo={photo} />

          {photo.beforeUrl && (
            <div className="mt-5 text-center">
              <Link
                href={`/gallery/${photo.id}/compare`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "font-mono text-[10px] uppercase tracking-[0.15em]"
                )}
              >
                <span className="text-safelight">RAW</span>
                &nbsp;ビフォーアフターを見る
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="font-heading text-4xl font-medium">{photo.title}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">
                {CATEGORY_LABELS[photo.category] ?? photo.category}
              </Badge>
              {dateTaken && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  {dateTaken}
                </span>
              )}
            </div>
            {photo.description && (
              <p className="mt-3 text-sm text-muted-foreground">
                {photo.description}
              </p>
            )}
          </div>

          {photo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {photo.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="mr-1 size-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          <div>
            <h2 className="eyebrow mb-4">EXIF Data</h2>
            <ExifTable photo={photo} />
          </div>

          <Separator />

          {/* 撮影来歴 — 生成AI不使用の表明 */}
          <div className="border border-border/60 p-4">
            <h2 className="eyebrow mb-3">
              <BadgeCheck className="mr-1.5 inline size-3.5 text-safelight" />
              Authenticity
            </h2>
            <ul className="exif-text space-y-1.5 text-muted-foreground">
              <li>Captured on {photo.cameraModel ?? "Sony α7R IV"}</li>
              {dateTaken && <li>Shot on {dateTaken}</li>}
              <li>Developed in Adobe Lightroom</li>
              <li className="text-foreground/80">
                No generative AI — 生成AIは使用していません
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
