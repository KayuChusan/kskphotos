import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import { Camera, Aperture, BadgeCheck, Monitor } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  ...pageSeo({ path: "/about" }),
  title: "プロフィール",
  description:
    "フォトグラファープロフィール — 使用機材、撮影スタイル、経歴について。",
};

const GEAR = {
  body: [{ name: "Sony α7R VI (ILCE-7RM6)", note: "61MP フルサイズ" }],
  lenses: [
    { name: "FE 16-35mm F2.8 GM", note: "広角ズーム" },
    { name: "FE 24-70mm F2.8 GM II", note: "標準ズーム" },
    { name: "FE 70-200mm F2.8 GM II", note: "望遠ズーム" },
    { name: "FE 35mm F1.4 GM", note: "広角単焦点" },
    { name: "FE 50mm F1.2 GM", note: "標準単焦点" },
    { name: "FE 85mm F1.4 GM", note: "中望遠単焦点" },
  ],
  software: [
    { name: "Adobe Lightroom Classic", note: "RAW 現像" },
    { name: "Adobe Photoshop", note: "レタッチ" },
  ],
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-10">
        <p className="eyebrow">Profile</p>
        <h1 className="mt-2 font-heading text-5xl font-medium">プロフィール</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          撮影者のプロフィールと使用機材について。
        </p>
      </div>

      {/* Profile */}
      <section className="mb-12">
        <div className="flex items-start gap-6">
          <div className="size-24 shrink-0 rounded-full bg-muted" />
          <div>
            <h2 className="font-heading text-2xl font-medium">ksk</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              東京を拠点に活動するフォトグラファー。ポートレート、風景、ストリートスナップを中心に撮影。
              Sony α7R VI の高解像度を活かした描写と、Lightroom
              での丁寧なRAW現像にこだわっています。
            </p>
          </div>
        </div>
      </section>

      <Separator className="mb-12" />

      {/* Gear */}
      <section>
        <h2 className="mb-6 font-heading text-3xl font-medium">撮影機材</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="size-5" />
                カメラ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {GEAR.body.map((item) => (
                  <li key={item.name} className="text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      {item.note}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Aperture className="size-5" />
                レンズ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {GEAR.lenses.map((item) => (
                  <li key={item.name} className="text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      {item.note}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="size-5" />
                ソフトウェア
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-wrap gap-x-8 gap-y-2">
                {GEAR.software.map((item) => (
                  <li key={item.name} className="text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      {item.note}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-12" />

      {/* 真正性ポリシー */}
      <section>
        <h2 className="mb-6 font-heading text-3xl font-medium">撮影ポリシー</h2>
        <div className="border border-border/60 p-6">
          <p className="eyebrow mb-4">
            <BadgeCheck className="mr-1.5 inline size-3.5 text-safelight" />
            No Generative AI
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            当サイトに掲載するすべての写真は、実際のカメラ（Sony α7R
            VI）で撮影したものです。現像は Adobe Lightroom での RAW
            現像（露出・色調整・トリミング）のみを行い、
            <span className="text-foreground">
              生成AIによる画像の生成・合成・要素の追加や削除は一切行っていません
            </span>
            。各写真の詳細ページでは撮影機材・撮影日などの来歴を、Before /
            After ページでは現像の過程をそのまま公開しています。
          </p>
        </div>
      </section>
    </div>
  );
}
