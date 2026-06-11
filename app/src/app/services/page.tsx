import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
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
  title: "Services",
  description:
    "撮影メニュー・料金 — ポートレート、ファミリー、イベント、商用撮影プラン。",
};

const POLITICS_MENU = [
  {
    title: "プロフィール撮影",
    price: "¥33,000",
    duration: "60 min / 税込",
    features: [
      "公式サイト・SNS・広報物用",
      "屋内外ロケーション対応",
      "セレクト10枚レタッチ納品",
      "使用権込み・クレジット不要",
      "1週間以内に納品",
    ],
  },
  {
    title: "ポスター用撮影一式",
    price: "¥55,000〜",
    duration: "120 min / 税込",
    features: [
      "選挙ポスター・リーフレット用",
      "衣装・表情パターン複数撮影",
      "印刷入稿に耐える高解像度データ",
      "デザイナー入稿用の調整対応",
      "プロフィール用カットも同時納品",
    ],
  },
  {
    title: "街宣・イベント記録",
    price: "¥44,000〜",
    duration: "半日 / 税込",
    features: [
      "街頭演説・集会・パーティー",
      "SNS 即時投稿用の速報納品対応",
      "100カット以上撮影",
      "セレクト30枚レタッチ納品",
      "1日対応・継続契約はご相談",
    ],
  },
];

const PLANS = [
  {
    title: "Portrait",
    price: "¥15,000",
    duration: "60 min",
    popular: false,
    features: [
      "ロケーション1箇所",
      "30カット以上撮影",
      "セレクト10枚レタッチ納品",
      "撮影データ全カット納品",
      "2週間以内に納品",
    ],
  },
  {
    title: "Family / Couple",
    price: "¥25,000",
    duration: "90 min",
    popular: true,
    features: [
      "ロケーション2箇所まで",
      "50カット以上撮影",
      "セレクト20枚レタッチ納品",
      "撮影データ全カット納品",
      "家族・カップル向け",
      "2週間以内に納品",
    ],
  },
  {
    title: "Event",
    price: "¥40,000〜",
    duration: "3 hours〜",
    popular: false,
    features: [
      "イベント全体をカバー",
      "100カット以上撮影",
      "セレクト50枚レタッチ納品",
      "撮影データ全カット納品",
      "長時間対応可（追加料金あり）",
      "3週間以内に納品",
    ],
  },
  {
    title: "Commercial",
    price: "要相談",
    duration: "要相談",
    popular: false,
    features: [
      "商用利用権込み",
      "企業・店舗・商品撮影",
      "カット数・レタッチ数は相談",
      "スタジオ撮影対応可",
      "ディレクション対応",
      "納期相談可",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-14 text-center">
        <p className="eyebrow">Menu &amp; Pricing</p>
        <h1 className="mt-3 font-heading text-5xl font-medium">Services</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sony α7R IV で撮影、Lightroom で丁寧にレタッチ。
        </p>
      </div>

      {/* 政治・選挙写真（注力メニュー） */}
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
              {POLITICS_MENU.map((item) => (
                <div key={item.title} className="rounded-lg border p-5">
                  <p className="font-heading text-xl font-medium">
                    {item.title}
                  </p>
                  <p className="exif-text mt-1 text-muted-foreground">
                    {item.duration}
                  </p>
                  <p className="mt-2 font-heading text-3xl font-medium">
                    {item.price}
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

      <div className="mb-8 text-center">
        <p className="eyebrow">General</p>
        <h2 className="mt-3 font-heading text-3xl font-medium">
          一般撮影メニュー
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <Card
            key={plan.title}
            className={cn(plan.popular && "border-safelight")}
          >
            <CardHeader>
              {plan.popular && (
                <Badge className="mb-2 w-fit bg-safelight font-mono text-[10px] uppercase tracking-[0.15em] text-black">
                  Popular
                </Badge>
              )}
              <CardTitle className="font-heading text-2xl font-medium">
                {plan.title}
              </CardTitle>
              <CardDescription className="exif-text">
                {plan.duration}
              </CardDescription>
              <p className="mt-1 font-heading text-4xl font-medium">
                {plan.price}
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
                    variant: plan.popular ? "default" : "outline",
                  }),
                  "w-full"
                )}
              >
                Book Now
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
