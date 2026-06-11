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
