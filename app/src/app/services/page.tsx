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
    "撮影料金 — 時間制で明朗会計。1時間 ¥11,000、撮影時間に応じてセレクト納品（1時間あたり約20枚）、レタッチは撮影1時間につき10枚込み。政治・選挙、商用、Web 制作・IT サポートにも対応。",
};

// 静的生成 + 管理画面の更新時にオンデマンド再検証
export const revalidate = 3600;

// 撮影料金（時間制）の早見表。撮影1時間につき約20枚（うちレタッチ仕上げ10枚）を納品。
const RATE_TABLE = [
  { time: "1時間", price: "¥11,000", deliver: "約20枚", retouch: "10枚", note: "プロフィール・宣材1カット" },
  { time: "2時間", price: "¥21,000", deliver: "約40枚", retouch: "20枚", note: "ファミリー・カップル" },
  { time: "半日（4時間）", price: "¥41,000", deliver: "約80枚", retouch: "40枚", note: "イベント・選挙ポスター一式" },
  { time: "1日（8時間）", price: "¥81,000", deliver: "約160枚", retouch: "80枚", note: "終日イベント・密着" },
];

// 料金に含まれるもの
const INCLUDED = [
  "出張撮影（出張費は別途実費）",
  "撮影時間に応じたセレクト納品（1時間あたり約20枚）",
  "うちレタッチ仕上げ（撮影1時間につき10枚）",
];

// オプション・追加料金
const ADDONS = [
  { label: "撮影時間の延長", price: "30分ごと +¥5,000（込みレタッチも比例で増加）" },
  { label: "レタッチ追加", price: "1枚 ¥1,000（10枚パック ¥8,000）" },
  { label: "印刷入稿用データ調整", price: "+¥5,000〜（ポスター・チラシ等）" },
  { label: "お急ぎ納品（3日以内）", price: "レタッチ1枚につき +¥500" },
  { label: "出張費", price: "実費（運賃／車は距離換算・お見積り時に明示）" },
];

function formatPrice(s: { price: number; priceNote: string | null }) {
  if (s.price > 0) return `¥${s.price.toLocaleString()}${s.priceNote ?? ""}`;
  return s.priceNote ?? "要相談";
}

export default async function ServicesPage() {
  // 撮影料金は時間制（下記のコード定義）で表示。Service DB は Web/IT のみ表示する。
  const web = await prisma.service.findMany({
    where: {
      isActive: true,
      category: { in: ["WEB_PRODUCTION", "IT_SUPPORT"] },
    },
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
    },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-14 text-center">
        <p className="eyebrow">Menu &amp; Pricing</p>
        <h1 className="mt-3 font-heading text-5xl font-medium">料金・メニュー</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          撮影は時間制で明朗会計。Sony α7R VI で撮影、Lightroom で丁寧にレタッチ。
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

      {/* 撮影料金（時間制） */}
      <section className="mb-16">
        <div className="mb-8 text-center">
          <p className="eyebrow">Photography</p>
          <h2 className="mt-3 font-heading text-3xl font-medium">撮影料金（時間制）</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            ジャンルで分けず、撮影時間で料金が決まります。
            ポートレートも家族写真もイベントも、同じ時間単価。分かりやすく、ごまかしません。
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {/* 早見表 */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">撮影時間</th>
                    <th className="py-2 pr-4 font-medium">料金（税込）</th>
                    <th className="py-2 pr-4 font-medium">納品枚数</th>
                    <th className="py-2 pr-4 font-medium">うちレタッチ</th>
                    <th className="py-2 font-medium">目安</th>
                  </tr>
                </thead>
                <tbody>
                  {RATE_TABLE.map((r) => (
                    <tr key={r.time} className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium">{r.time}</td>
                      <td className="py-3 pr-4 font-heading text-xl font-medium">
                        {r.price}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {r.deliver}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {r.retouch}
                      </td>
                      <td className="py-3 text-muted-foreground">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {/* 含まれるもの */}
              <div>
                <p className="mb-3 font-heading text-lg font-medium">料金に含まれるもの</p>
                <ul className="space-y-2">
                  {INCLUDED.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* オプション */}
              <div>
                <p className="mb-3 font-heading text-lg font-medium">オプション・追加料金</p>
                <ul className="space-y-2.5">
                  {ADDONS.map((a) => (
                    <li key={a.label} className="text-sm">
                      <span className="font-medium">{a.label}</span>
                      <span className="ml-2 text-muted-foreground">{a.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              全カット納品ではなく、撮影時間に応じた枚数（1時間あたり約20枚）をセレクトしてお渡しします。
              延長は当日でも対応可。レタッチ枚数・納期はご相談ください。請求書・領収書の発行に対応。
            </p>
            <Link href="/booking" className={cn(buttonVariants(), "shrink-0")}>
              撮影を相談する
            </Link>
          </CardFooter>
        </Card>
      </section>

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
              <strong className="text-foreground">料金は上記の時間制と同じ</strong>
              。ポスターは印刷入稿用データの調整に対応し、継続契約（撮影同行・SNS
              素材供給）もご相談いただけます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                "プロフィール・公式サイト・SNS 用",
                "選挙ポスター・リーフレット用撮影",
                "街宣・集会・パーティーの記録",
                "印刷入稿用データ調整に対応",
                "ポスター・広報物への使用許諾込み",
                "継続契約・撮影同行もご相談",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/booking" className={cn(buttonVariants(), "shrink-0")}>
              相談する
            </Link>
          </CardFooter>
        </Card>
      </section>

      {/* 商用・法人の注記 */}
      <div className="mx-auto mb-20 max-w-2xl border border-border/60 px-6 py-5 text-center">
        <p className="font-heading text-lg font-medium">商用・法人撮影</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          企業・店舗・商品の撮影も撮影単価は同じ時間制です。打ち合わせ・修正・関係者調整が入るため
          <strong className="text-foreground">最低2時間〜</strong>
          、内容により別途お見積りします。商用利用 OK・請求書発行に対応。
        </p>
      </div>

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
