import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { FileCheck, MapPin, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getUnlockedCollectionIds } from "@/lib/unlock-server";
import { LockedTile } from "@/components/gallery/locked-tile";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  ...pageSeo({ path: "/works" }),
  title: "撮影実績",
  description:
    "撮影実績 — 議員・候補者のポートレートをはじめ、政治・選挙写真からファミリーフォトまで、ジャンル別にご覧いただけます。",
};

// 解錠状態(Cookie)をリクエストごとに反映するため動的レンダリング
export const dynamic = "force-dynamic";

// カテゴリ（ジャンル）の日本語ラベルと表示順
const CATEGORY_LABELS: Record<string, string> = {
  PORTRAIT: "ポートレート",
  EVENT: "イベント",
  STREET: "スナップ",
  LANDSCAPE: "風景",
  ARCHITECTURE: "建築",
  FOOD: "フード",
  OTHER: "その他",
};
const CATEGORY_ORDER = [
  "PORTRAIT",
  "EVENT",
  "STREET",
  "LANDSCAPE",
  "ARCHITECTURE",
  "FOOD",
  "OTHER",
] as const;

const FIELDS = [
  {
    title: "政治・選挙",
    description:
      "議員・候補者のプロフィール写真、選挙ポスター用撮影、街宣・集会の記録。政治活動を撮り続けているからこそ撮れる、現場の空気感と人柄を引き出す一枚を。",
  },
  {
    title: "ファミリー・ポートレート",
    description:
      "七五三・お宮参り・家族写真の出張撮影。神奈川・東京を中心に、公園や神社などお好きなロケーションへ伺います。",
  },
  {
    title: "イベント・ビジネス",
    description:
      "講演会・セミナー・パーティーの記録撮影、Web サイトや SNS 用の素材撮影。広報担当の方からのご依頼も承ります。",
  },
  {
    title: "Web 制作・IT サポート",
    description:
      "現役インフラエンジニアとして、サイト制作や配信環境の構築、保守・運用まで対応。撮影とセットでの一括依頼も可能です。",
  },
];

export default async function WorksPage() {
  // 会員写真も除外せず取得し、未解錠ならモザイク表示する
  const [rows, unlockedIds] = await Promise.all([
    prisma.photo.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        category: true,
        imageUrl: true,
        thumbnailUrl: true,
        imageWidth: true,
        imageHeight: true,
        blurDataUrl: true,
        collectionId: true,
        collection: { select: { isLocked: true } },
      },
    }),
    getUnlockedCollectionIds(),
  ]);
  const unlocked = new Set(unlockedIds);
  // 未解錠の会員写真は本画像 URL を取り除き、モザイクタイルで表示する
  const photos = rows.map((p) => {
    const masked =
      !!p.collection?.isLocked &&
      !(p.collectionId != null && unlocked.has(p.collectionId));
    return masked ? { ...p, imageUrl: "", thumbnailUrl: null, masked } : { ...p, masked };
  });

  // ジャンル（カテゴリ）別にまとめる。写真のある順序カテゴリのみ表示
  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    label: CATEGORY_LABELS[cat],
    items: photos.filter((p) => p.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-14 text-center">
        <p className="eyebrow">Selected Works</p>
        <h1 className="mt-3 font-heading text-5xl font-medium">撮影実績</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          政治・選挙写真からファミリーフォトまで、ジャンル別にご覧いただけます。
        </p>
      </div>

      {/* ジャンル（カテゴリ）別の実績 */}
      {groups.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          実績はまだありません。
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.cat} className="mb-20">
            <div className="mb-8 flex items-baseline gap-3">
              <h2 className="font-heading text-3xl font-medium">{group.label}</h2>
              <span className="exif-text text-muted-foreground">
                {group.items.length} 点
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/gallery/${photo.id}`}
                  className="group block"
                >
                  {photo.masked ? (
                    <LockedTile
                      blurDataUrl={photo.blurDataUrl}
                      width={photo.imageWidth}
                      height={photo.imageHeight}
                      className="viewfinder"
                    />
                  ) : (
                    <div className="viewfinder relative overflow-hidden">
                      <Image
                        src={photo.thumbnailUrl ?? photo.imageUrl}
                        alt={photo.title}
                        width={photo.imageWidth ?? 1200}
                        height={photo.imageHeight ?? 800}
                        placeholder={photo.blurDataUrl ? "blur" : "empty"}
                        blurDataURL={photo.blurDataUrl ?? undefined}
                        className="h-auto w-full transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.02] group-hover:brightness-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="mt-3">
                    <p className="font-heading text-lg font-medium">
                      {photo.title}
                    </p>
                    <p className="exif-text mt-1 text-muted-foreground">
                      {photo.masked ? "会員限定" : group.label}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}

      {/* 対応領域 */}
      <section className="mb-20">
        <div className="mb-8 text-center">
          <p className="eyebrow">Fields</p>
          <h2 className="mt-3 font-heading text-3xl font-medium">対応領域</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {FIELDS.map((field) => (
            <Card key={field.title}>
              <CardHeader>
                <CardTitle className="font-heading text-xl font-medium">
                  {field.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {field.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 依頼まわりの安心材料 */}
      <section className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl font-medium">
              ご依頼にあたって
            </CardTitle>
            <CardDescription>
              個人・法人・政治団体いずれからのご依頼にも対応しています
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-4 text-sm sm:grid-cols-3">
              <li className="flex items-start gap-2">
                <FileCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                請求書・領収書の発行に対応（政治資金からのお支払いも処理しやすい明朗会計）
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                神奈川・東京を中心に出張撮影（その他エリアはご相談ください）
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                Sony α7R VI で撮影、Lightroom レタッチのうえ 2 週間以内に納品
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          料金の詳細とご依頼はこちらから
        </p>
        <div className="flex gap-3">
          <Link
            href="/services"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            料金を見る
          </Link>
          <Link href="/booking" className={cn(buttonVariants())}>
            撮影を依頼する
          </Link>
        </div>
      </div>
    </div>
  );
}
