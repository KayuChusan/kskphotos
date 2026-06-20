import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import Link from "next/link";
import { Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  ...pageSeo({ path: "/services" }),
  title: "料金・メニュー",
  description:
    "撮影メニュー・料金 — 政治・選挙、ポートレート、ファミリー、イベント、商用撮影、Web 制作・IT サポート。",
};

// 静的生成 + 管理画面の更新時にオンデマンド再検証
export const revalidate = 3600;

function formatPrice(s: { price: number; priceNote: string | null }) {
  if (s.price > 0) return `¥${s.price.toLocaleString()}${s.priceNote ?? ""}`;
  return s.priceNote ?? "要相談";
}

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      priceNote: true,
      duration: true,
      category: true,
      features: true,
      isPopular: true,
    },
  });

  const politics = services.filter((s) => s.category === "POLITICS");
  const web = services.filter(
    (s) => s.category === "WEB_PRODUCTION" || s.category === "IT_SUPPORT"
  );
  const general = services.filter(
    (s) =>
      s.category !== "POLITICS" &&
      s.category !== "WEB_PRODUCTION" &&
      s.category !== "IT_SUPPORT"
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-14 text-center">
        <p className="eyebrow">Menu &amp; Pricing</p>
        <h1 className="mt-3 font-heading text-5xl font-medium">料金・メニュー</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sony α7R VI で撮影、Lightroom で丁寧にレタッチ。
        </p>
      </div>

      {/* 実績づくり特別価格の案内（静的） */}
      <div className="mx-auto mb-14 max-w-2xl border border-safelight/40 bg-safelight/5 px-6 py-5 text-center">
        <p className="exif-text text-safelight">
          <span className="mr-1.5">●</span> 開業準備期間 特別価格
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          現在は実績づくりの期間として、相場より抑えた特別価格でご案内しています。
          掲載作例への使用にご協力いただける場合は、さらにご相談に応じます。
          <br className="hidden sm:block" />
          ※ 価格は予告なく改定する場合があります。早めのご依頼がお得です。
        </p>
      </div>

      {/* 政治・選挙写真（注力メニュー） */}
      {politics.length > 0 && (
        <section className="mb-16">
          <Card className="border-safelight">
            <CardHeader>
              <Badge className="mb-2 w-fit bg-safelight font-mono text-[10px] uppercase tracking-[0.15em] text-black">
                Politics &amp; Election
              </Badge>
              <CardTitle className="font-heading text-3xl font-medium">
                政治・選挙写真
              </CardTitle>
              <CardDescription>
                議員・候補者のプロフィールから選挙ポスター、街宣・集会の記録まで。
                政治活動を撮り続けているフォトグラファーが、現場を分かったうえで撮影します。
                請求書・領収書の発行に対応。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {politics.map((item) => (
                  <div key={item.id} className="rounded-lg border p-5">
                    <p className="font-heading text-xl font-medium">
                      {item.title}
                    </p>
                    {item.duration && (
                      <p className="exif-text mt-1 text-muted-foreground">
                        {item.duration}
                      </p>
                    )}
                    <p className="mt-2 font-heading text-3xl font-medium">
                      {formatPrice(item)}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {item.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                ポスター・広報物への使用権込み。継続契約（月額での撮影同行・SNS
                素材供給）もご相談ください。
              </p>
              <Link href="/booking" className={cn(buttonVariants(), "shrink-0")}>
                相談する
              </Link>
            </CardFooter>
          </Card>
        </section>
      )}

      {/* 一般撮影メニュー */}
      {general.length > 0 && (
        <>
          <div className="mb-8 text-center">
            <p className="eyebrow">General</p>
            <h2 className="mt-3 font-heading text-3xl font-medium">
              一般撮影メニュー
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {general.map((plan) => (
              <Card
                key={plan.id}
                className={cn(plan.isPopular && "border-safelight")}
              >
                <CardHeader>
                  {plan.isPopular && (
                    <Badge className="mb-2 w-fit bg-safelight font-mono text-[10px] uppercase tracking-[0.15em] text-black">
                      Popular
                    </Badge>
                  )}
                  <CardTitle className="font-heading text-2xl font-medium">
                    {plan.title}
                  </CardTitle>
                  {plan.duration && (
                    <CardDescription className="exif-text">
                      {plan.duration}
                    </CardDescription>
                  )}
                  <p className="mt-1 font-heading text-4xl font-medium">
                    {formatPrice(plan)}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link
                    href="/booking"
                    className={cn(
                      buttonVariants({
                        variant: plan.isPopular ? "default" : "outline",
                      }),
                      "w-full"
                    )}
                  >
                    このプランで相談
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Web 制作・IT サポート */}
      {web.length > 0 && (
        <section className="mt-20">
          <div className="mb-8 text-center">
            <p className="eyebrow">Web &amp; IT</p>
            <h2 className="mt-3 font-heading text-3xl font-medium">
              サイト制作・IT サポート
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              現役インフラエンジニアとして、撮影だけでなく Web まわりも一括で支援します。
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {web.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="font-heading text-xl font-medium">
                    {item.title}
                  </CardTitle>
                  {item.duration && (
                    <CardDescription className="exif-text">
                      {item.duration}
                    </CardDescription>
                  )}
                  <p className="mt-1 font-heading text-3xl font-medium">
                    {formatPrice(item)}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link
                    href="/contact"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full"
                    )}
                  >
                    相談する
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
