import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import {
  Blocks,
  Camera,
  Check,
  Clock,
  Cloud,
  Globe,
  Landmark,
  LifeBuoy,
  MapPin,
  RefreshCw,
  Search,
  Server,
  Share2,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { pageSeo } from "@/lib/seo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JaText } from "@/components/ui/ja-text";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  ...pageSeo({ path: "/guide" }),
  title: "ご利用案内",
  description:
    "写真撮影・Web制作・ITサポートのご利用案内。撮影の流れと納品、Web制作の進め方とSEO・高速表示・拡張性など標準で入る品質、料金の考え方やお支払いについて。",
};

// 目的別の入口（撮影 / Web / IT へジャンプ）
const CHOOSE = [
  {
    icon: Camera,
    title: "写真撮影について",
    desc: "撮影の流れ・こだわり・納品",
    href: "#photo",
  },
  {
    icon: Globe,
    title: "Web 制作について",
    desc: "進め方・つくるサイト・実例",
    href: "#web",
  },
  {
    icon: Wrench,
    title: "IT サポートについて",
    desc: "運用・サーバー・困りごと",
    href: "#it",
  },
];

// 撮影の流れ
const PHOTO_FLOW = [
  {
    no: "01",
    title: "ご相談・お問い合わせ",
    body: "撮影内容・ご希望日・場所をお知らせください。内容を確認し、2営業日以内にご連絡します。",
  },
  {
    no: "02",
    title: "お打ち合わせ・お見積り",
    body: "ご要望をうかがい、プランと料金をご提案。日程と撮影場所を一緒に決めていきます。",
  },
  {
    no: "03",
    title: "撮影当日",
    body: "ご指定の場所へ出張。その場の空気ごと、自然な表情を撮影します。",
  },
  {
    no: "04",
    title: "現像・納品",
    body: "Lightroom で丁寧にレタッチ。撮影時間に応じた枚数（1時間あたり約20枚）をセレクトし、2週間以内にデータでお渡しします。",
  },
];

// 撮影のこだわり
const PHOTO_FEATURES = [
  {
    icon: MapPin,
    title: "出張撮影",
    body: "ご指定の場所へうかがって撮影。屋外ロケーションから式典・イベント会場まで対応します。",
  },
  {
    icon: Clock,
    title: "時間制で明朗会計",
    body: "ジャンルで分けず、撮影時間で料金が決まります。分かりやすく、ごまかしません。",
  },
  {
    icon: Sparkles,
    title: "RAW から丁寧に現像",
    body: "撮影後は Lightroom で一枚ずつレタッチ。色と光を整え、見栄えよく仕上げます。",
  },
  {
    icon: ShieldCheck,
    title: "生成 AI 不使用・EXIF 保持",
    body: "撮ったままの真正な記録。撮影制作物に生成 AI は使っていません。",
  },
];

// Web の対応範囲
const WEB_SCOPE = [
  {
    icon: Globe,
    title: "新規サイト制作",
    body: "構成・デザイン・実装・公開まで一括。LP・ポートフォリオ・予約サイト・後援会サイトなど。",
  },
  {
    icon: Wrench,
    title: "運用・保守",
    body: "公開後の更新作業、ドメイン・サーバー・SSL の管理、障害時の一次対応まで継続でサポート。当社制作のサイトは、制作から運用への移行で最初の3ヶ月を無償サポート（軽微な更新・修正を月2回まで。新規ページ追加・デザイン刷新・機能追加は別途お見積り）。",
  },
  {
    icon: RefreshCw,
    title: "引き継ぎ・リニューアル",
    body: "他社制作・自作サイトの運用引き継ぎや、デザイン刷新・表示速度/スマホ対応の改善にも対応。",
  },
];

// Web 制作の進め方（誰にでも分かる流れ）
const WEB_FLOW = [
  {
    no: "01",
    title: "ご相談・ヒアリング",
    body: "目的・載せたい内容・イメージをうかがいます。要望が固まっていなくても大丈夫です。",
  },
  {
    no: "02",
    title: "構成・お見積り",
    body: "ページの組み立てと必要な機能を整理し、料金とスケジュールをご提示します。",
  },
  {
    no: "03",
    title: "デザイン",
    body: "見た目の方向性を決め、スマホでも読みやすい形に整えます。",
  },
  {
    no: "04",
    title: "制作（実装）",
    body: "コードで一つひとつ組み立て。表示の速さ・安全性まで作り込みます。",
  },
  {
    no: "05",
    title: "公開",
    body: "独自ドメイン・SSL を設定し、検索にも載るよう整えて公開します。",
  },
  {
    no: "06",
    title: "公開後の運用",
    body: "更新のしかたをお渡し。保守や機能の追加も継続して対応します。",
  },
];

// どんなサイトをつくるか（技術の強みを「何が嬉しいか」で説明）
const SITE_FEATURES = [
  {
    icon: Search,
    title: "検索で見つけてもらえる",
    body: "名前やサービスで検索したときに表示されるよう、タイトル・説明・表示速度・スマホ対応など、検索エンジンが評価する基本（SEO）を最初から押さえて作ります。",
  },
  {
    icon: Zap,
    title: "速くて、安全",
    body: "既製テンプレートの使い回しではなく、必要なものを丁寧にコードで実装。表示が速く、壊れにくく、安全です。現役インフラエンジニアの本職品質。",
  },
  {
    icon: Blocks,
    title: "あとから増やせる",
    body: "まず小さく始めて、後から予約フォーム・写真ギャラリー・会員ページなどを用途に応じて追加できます。作り直しではなく、育てられるサイトです。",
  },
  {
    icon: Cloud,
    title: "規模に合わせて無理なく",
    body: "Google などのクラウド上で動かすので、アクセスが増えても自動で対応。使った分だけの低コスト運用もできます。",
  },
];

// 標準で入っているもの（このサイト自身でも採用している品質。カッコ内は「何が嬉しいか」）
const STANDARD = [
  "検索対策（SEO）標準装備 — 構造化データ・サイトマップ・SNS 共有カードを自動で用意し、Google や各 SNS に情報が正しく伝わります",
  "高速表示 — 写真は最適なサイズ・形式（WebP）に変換して配信、ページは静的並みに速い仕組み（ISR）で常に最新かつ軽快",
  "なめらかなページ遷移 — 画面の切り替えがスッとつながり、見ていて気持ちのいい操作感",
  "スマホ・アクセシビリティ対応 — スマホ最適化はもちろん、文字の読みやすさ・色のコントラスト・キーボード操作まで配慮",
  "独自ドメイン・SSL（https）対応 — 安全な接続と信頼される URL を標準で設定",
  "落ちにくく低コストなクラウド運用 — アクセスがなければ自動で休み、増えれば自動で増強。無駄なく安定",
];

const SHOWCASE_LINKS = [
  { href: "/gallery", label: "地図ギャラリーを見る" },
  { href: "/dashboard", label: "EXIF ダッシュボードを見る" },
  { href: "/collections", label: "コレクションを見る" },
];

// IT サポート（撮影・Web 以外の「ITまわり」全般）
const IT_SUPPORT = [
  {
    icon: Wrench,
    title: "サイトの運用・保守",
    body: "公開後の更新代行、改善、障害時の一次対応まで継続でサポートします。",
  },
  {
    icon: Server,
    title: "ドメイン・サーバー・メール",
    body: "取得・設定・移管から、メールや SSL の管理・トラブル対応まで引き受けます。",
  },
  {
    icon: LifeBuoy,
    title: "PC・ツールの困りごと",
    body: "「なんだか動かない」を気軽に相談できる、頼れる一次窓口になります。",
  },
  {
    icon: Share2,
    title: "SNS 運用環境の整備",
    body: "アカウントの整備や、投稿に使う素材の供給体制づくりをお手伝いします。",
  },
  {
    icon: Landmark,
    title: "政治・選挙の IT サポート",
    body: "公式・後援会サイトの構築、SNS 運用環境の整備や素材供給まで一括で支援します。",
  },
];

// ご利用にあたっての取り決め
const DETAILS = [
  {
    term: "お支払い",
    body: "内容をうかがってお見積りを提示し、ご合意のうえでご依頼確定となります。お支払いは柔軟に対応し、基本は銀行振込です（前金・分割のご相談も内容に応じて承ります）。振込手数料はお客様のご負担とさせていただいております。",
  },
  {
    term: "キャンセル・日程変更",
    body: "ご予約日程の確定後にキャンセルや日程変更が生じる場合は、できるだけ早めにご連絡ください。撮影日に近いキャンセルや、制作着手後のキャンセルについては、進行状況に応じて費用を申し受ける場合があります。詳細はご依頼時の取り決めによります。",
  },
  {
    term: "納品",
    body: "撮影データは撮影後おおむね 1〜3 週間。全カットではなく、撮影時間に応じた枚数（1時間あたり約20枚、うちレタッチ仕上げ10枚）をセレクトしてお渡しします。Web サイトは規模により異なり、お見積り時にスケジュールをご提示します。",
  },
  {
    term: "著作権・使用について",
    body: "納品した写真は、ご依頼の用途の範囲でご自由にお使いいただけます。撮影制作物に生成 AI は使用していません。利用範囲のご希望（商用・二次利用等）はお気軽にご相談ください。",
  },
];

// 流れの番号付きカード（撮影・Web 共通）
function FlowGrid({ steps }: { steps: { no: string; title: string; body: string }[] }) {
  return (
    <ol className="mt-6 grid gap-4 sm:grid-cols-2">
      {steps.map((step) => (
        <li key={step.no}>
          <Card className="h-full">
            <CardContent className="flex gap-4">
              <span className="exif-text shrink-0 text-safelight">{step.no}</span>
              <div>
                <h4 className="font-heading text-base font-medium">
                  <JaText>{step.title}</JaText>
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  <JaText>{step.body}</JaText>
                </p>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ol>
  );
}

// アイコン付き特徴カードのグリッド
function FeatureGrid({
  items,
  cols = "sm:grid-cols-2",
}: {
  items: { icon: React.ElementType; title: string; body: string }[];
  cols?: string;
}) {
  return (
    <div className={cn("mt-6 grid gap-4", cols)}>
      {items.map(({ icon: Icon, title, body }) => (
        <Card key={title}>
          <CardContent>
            <Icon className="size-5 text-safelight" />
            <h4 className="mt-3 font-heading text-base font-medium">
              <JaText>{title}</JaText>
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              <JaText>{body}</JaText>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="eyebrow">Guide</p>
        <h1 className="mt-2 font-heading text-5xl font-medium">ご利用案内</h1>
        <p className="mt-4 max-w-2xl text-sm leading-loose text-muted-foreground md:text-base md:leading-loose">
          <JaText>
            <strong className="text-foreground">写真撮影・Web 制作・IT サポート</strong>
            を一人の窓口でお引き受けします。ご検討中の項目から、お進みください。
          </JaText>
        </p>
      </div>

      {/* 目的別の入口 */}
      <nav aria-label="目的から探す" className="grid gap-3 sm:grid-cols-3">
        {CHOOSE.map(({ icon: Icon, title, desc, href }) => (
          <a
            key={href}
            href={href}
            className="group rounded-xl ring-1 ring-foreground/10 transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex items-center gap-3 p-5">
              <Icon className="size-5 shrink-0 text-safelight" />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{title}</span>
                <span className="block text-xs text-muted-foreground">
                  <JaText>{desc}</JaText>
                </span>
              </span>
            </span>
          </a>
        ))}
      </nav>

      {/* ワンストップの価値 */}
      <Card className="mt-10 border-safelight/40 bg-safelight/5">
        <CardHeader>
          <p className="eyebrow">
            <span className="text-safelight">One-stop</span> / 撮影 × Web
          </p>
          <h2 className="mt-2 font-heading text-2xl font-medium md:text-3xl">
            まとめて頼めて、別々より、お得。
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-loose text-muted-foreground">
            <JaText>
              撮影会社と制作会社に別々に依頼すると、素材の受け渡しや認識合わせに手間がかかり、費用も二重になりがちです。KSK
              Works なら撮影〜サイト公開までを一人の窓口で完結。
              <strong className="text-foreground">
                撮影と Web 制作をまとめてご依頼いただくと、それぞれ個別に頼むより割安なセット価格
              </strong>
              でご提供します（内容に応じてお見積り）。
            </JaText>
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <Camera className="size-4 text-safelight" />
            <span>撮影</span>
            <span className="text-muted-foreground/40">→</span>
            <span>写真素材</span>
            <span className="text-muted-foreground/40">→</span>
            <Globe className="size-4 text-safelight" />
            <span>Web サイト</span>
            <span className="text-muted-foreground/40">→</span>
            <Wrench className="size-4 text-safelight" />
            <span>運用</span>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-12" />

      {/* 写真撮影について */}
      <section id="photo" className="scroll-mt-24">
        <p className="eyebrow">Photography</p>
        <h2 className="mt-2 font-heading text-2xl font-medium md:text-3xl">
          写真撮影について
        </h2>
        <p className="mt-3 text-sm leading-loose text-muted-foreground">
          <JaText>
            ポートレート・ファミリー・イベントから、政治・選挙、商用・法人まで。ジャンルを問わず
            <strong className="text-foreground">時間制</strong>
            でお引き受けします。出張で現場へうかがい、RAW から丁寧に仕上げてお渡しします。
          </JaText>
        </p>

        <h3 className="mt-8 font-heading text-lg font-medium">撮影の流れ</h3>
        <FlowGrid steps={PHOTO_FLOW} />

        <h3 className="mt-8 font-heading text-lg font-medium">撮影のこだわり</h3>
        <FeatureGrid items={PHOTO_FEATURES} />

        <div className="mt-6">
          <Link
            href="/services"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            撮影料金（時間制）を見る →
          </Link>
        </div>
      </section>

      <Separator className="my-12" />

      {/* Web 制作について */}
      <section id="web" className="scroll-mt-24">
        <p className="eyebrow">Web</p>
        <h2 className="mt-2 font-heading text-2xl font-medium md:text-3xl">
          Web 制作について
        </h2>
        <p className="mt-3 text-sm leading-loose text-muted-foreground">
          <JaText>
            新規制作から運用・引き継ぎ・リニューアルまで。テンプレートの流用ではなく、用途に合わせて一つひとつ設計してつくります。
          </JaText>
        </p>

        <h3 className="mt-8 font-heading text-lg font-medium">Web の対応範囲</h3>
        <FeatureGrid items={WEB_SCOPE} cols="sm:grid-cols-3" />

        <h3 className="mt-8 font-heading text-lg font-medium">サイトができるまで</h3>
        <p className="mt-2 text-sm leading-loose text-muted-foreground">
          <JaText>
            ご相談から公開・運用まで、一人の窓口で進めます。専門用語はかみ砕いてご説明するので、はじめての方でも安心です。
          </JaText>
        </p>
        <FlowGrid steps={WEB_FLOW} />

        <h3 className="mt-8 font-heading text-lg font-medium">
          どんなサイトをつくるか
        </h3>
        <p className="mt-2 text-sm leading-loose text-muted-foreground">
          <JaText>
            安く見せるためのテンプレート流用ではありません。検索・速度・安全・拡張性まで、長く使えるサイトの土台をはじめから作り込みます。
          </JaText>
        </p>
        <FeatureGrid items={SITE_FEATURES} />

        {/* 標準で入っているもの */}
        <Card className="mt-4">
          <CardHeader>
            <h4 className="font-heading text-base font-medium">
              すべてのサイトに標準で入っているもの
            </h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <JaText>
                追加料金のオプションではなく、最初から含めて作ります（このサイト自身でも使っている仕組みです）。
              </JaText>
            </p>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {STANDARD.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs leading-relaxed"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* このサイト自体が見本 */}
        <Card className="mt-8 border-safelight/40 bg-safelight/5">
          <CardHeader>
            <p className="eyebrow">
              <span className="text-safelight">Showcase</span> / 動いている実例
            </p>
            <h3 className="mt-2 font-heading text-xl font-medium md:text-2xl">
              このサイト自体が、つくれるものの見本です。
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-loose text-muted-foreground">
              <JaText>
                いまご覧いただいているこのサイトは、すべて手づくり。
                <strong className="text-foreground">
                  地図から写真をたどる「地図ギャラリー」、撮影データを自動でグラフ化する「EXIF
                  ダッシュボード」、現像前後を見比べる「ビフォーアフター」、合言葉で限定公開する「会員ページ」
                </strong>
                ——こうした仕組みも、ご要望に応じてあなたのサイトに組み込めます。カタログではなく、実際に動くものでご判断いただけます。
              </JaText>
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {SHOWCASE_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  {label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      {/* IT サポート */}
      <section id="it" className="scroll-mt-24">
        <p className="eyebrow">IT Support</p>
        <h2 className="mt-2 font-heading text-2xl font-medium md:text-3xl">
          その他、IT まわりもお任せください
        </h2>
        <p className="mt-3 text-sm leading-loose text-muted-foreground">
          <JaText>
            撮影や Web 制作だけでなく、<strong className="text-foreground">現役インフラエンジニア</strong>
            として日々の「ちょっと困った」も引き受けます。サーバーやメールの設定から、PC・ツールのトラブル、SNS
            まわりの整備まで。どこに頼めばいいか分からないことこそ、まずはご相談ください。
          </JaText>
        </p>
        <FeatureGrid items={IT_SUPPORT} cols="sm:grid-cols-2 lg:grid-cols-3" />
        <div className="mt-6">
          <Link
            href="/contact"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            IT のご相談はこちら →
          </Link>
        </div>
      </section>

      <Separator className="my-12" />

      {/* 料金の考え方・取り決め */}
      <section id="notes" className="scroll-mt-24">
        <p className="eyebrow">Notes</p>
        <h2 className="mt-2 font-heading text-2xl font-medium md:text-3xl">
          ご利用にあたって
        </h2>

        <Card className="mt-6">
          <CardContent className="px-0">
            <div className="divide-y divide-border/60">
              {/* 料金の考え方（/services への導線を含む） */}
              <div className="px-6 py-5">
                <h3 className="font-heading text-base font-medium">
                  料金の考え方
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  撮影プランと Web 制作の料金は
                  <Link
                    href="/services"
                    className="mx-0.5 font-medium text-foreground underline underline-offset-4"
                  >
                    料金・メニュー
                  </Link>
                  に掲載しています（撮影はプラン別、サイト制作は規模別のお見積り）。撮影と
                  Web をまとめてご依頼の場合は、セット価格で個別依頼より割安になります。正確な金額は、ご要望をうかがったうえでお見積りをご提示します。
                </p>
              </div>
              {DETAILS.map(({ term, body }) => (
                <div key={term} className="px-6 py-5">
                  <h3 className="font-heading text-base font-medium">{term}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <div className="mt-14 border-t pt-10 text-center">
        <p className="text-sm text-muted-foreground">
          撮影だけ・サイトだけのご依頼も、まとめてのご相談も歓迎です。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className={cn(buttonVariants())}>
            相談・お問い合わせ
          </Link>
          <Link
            href="/booking"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            撮影のご依頼
          </Link>
          <Link
            href="/services"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            料金・メニュー
          </Link>
        </div>
      </div>
    </div>
  );
}
