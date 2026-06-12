import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FileCheck, MapPin, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Works",
  description:
    "撮影実績 — 国民民主党 議員・候補者のポートレートをはじめ、政治・選挙写真からファミリーフォトまで。",
};

// 静的生成 + 管理画面の更新時にオンデマンド再検証（revalidatePhotoPages）
export const revalidate = 3600;

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
  const photos = await prisma.photo.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      thumbnailUrl: true,
      imageWidth: true,
      imageHeight: true,
      blurDataUrl: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-14 text-center">
        <p className="eyebrow">Selected Works</p>
        <h1 className="mt-3 font-heading text-5xl font-medium">Works</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          政治・選挙写真からファミリーフォトまで、KSK Works の撮影実績。
        </p>
      </div>

      {/* 政治・選挙ポートレート実績 */}
      <section className="mb-20">
        <div className="mb-8">
          <Badge className="mb-3 bg-safelight font-mono text-[10px] uppercase tracking-[0.15em] text-black">
            Politics
          </Badge>
          <h2 className="font-heading text-3xl font-medium">
            国民民主党 議員・候補者ポートレート
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            政治活動の現場で撮り続けてきた、議員・候補者のポートレート。
            この経験をもとに、プロフィール写真やポスター・SNS
            用の撮影をお引き受けします。
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              href={`/gallery/${photo.id}`}
              className="group block"
            >
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
              <div className="mt-3">
                <p className="font-heading text-lg font-medium">
                  {photo.title}
                </p>
                <p className="exif-text mt-1 text-muted-foreground">
                  Portrait
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
                Sony α7R IV で撮影、Lightroom レタッチのうえ 2 週間以内に納品
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
          <Link href="/services" className={cn(buttonVariants({ variant: "outline" }))}>
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
