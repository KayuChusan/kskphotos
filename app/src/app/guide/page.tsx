import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import {
  Blocks,
  Camera,
  Check,
  Cloud,
  Globe,
  RefreshCw,
  Search,
  Wrench,
  Zap,
} from "lucide-react";
import { pageSeo } from "@/lib/seo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  ...pageSeo({ path: "/guide" }),
  title: "ご利用案内",
  description:
    "撮影とWebサイトをまとめて任せられるワンストップ対応。制作の流れ、SEO・高速表示・拡張性など標準で入る品質、料金の考え方・お支払い・納品について。新規制作から運用・引き継ぎ・リニューアルまで。",
};

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
const FLOW = [
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

export default function GuidePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <p className="eyebrow">Guide</p>
      <h1 className="mb-4 mt-2 font-heading text-5xl font-medium">ご利用案内</h1>
      <p className="mb-12 max-w-2xl text-sm leading-loose text-muted-foreground md:text-base md:leading-loose">
        KSK Works は、<strong className="text-foreground">写真撮影と Web サイト</strong>を
        まとめてお任せいただけるのが強みです。撮影で生まれた写真素材を、そのまま活きるかたちで
        サイトに落とし込む——
        <strong className="text-foreground">
          素材づくりからサイトの公開・運用までを一元化
        </strong>
        できます。
      </p>

      {/* ワンストップの価値 */}
      <section className="mb-14 border bg-card p-6 md:p-8">
        <p className="eyebrow">
          <span className="text-safelight">One-stop</span> / 撮影 × Web
        </p>
        <h2 className="mt-2 font-heading text-2xl font-medium md:text-3xl">
          まとめて頼めて、別々より、お得。
        </h2>
        <p className="mt-4 text-sm leading-loose text-muted-foreground">
          撮影会社と制作会社に別々に依頼すると、素材の受け渡しや認識合わせに手間がかかり、
          費用も二重になりがちです。KSK Works なら撮影〜サイト公開までを一人の窓口で完結。
          <strong className="text-foreground">
            撮影と Web 制作をまとめてご依頼いただくと、それぞれ個別に頼むより割安なセット価格
          </strong>
          でご提供します（内容に応じてお見積り）。
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
      </section>

      {/* Web の対応範囲 */}
      <section className="mb-14">
        <h2 className="font-heading text-2xl font-medium md:text-3xl">
          Web の対応範囲
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {WEB_SCOPE.map(({ icon: Icon, title, body }) => (
            <div key={title} className="border p-5">
              <Icon className="size-5 text-safelight" />
              <h3 className="mt-3 text-sm font-semibold">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Web 制作の流れ */}
      <section className="mb-14">
        <p className="eyebrow">How we build</p>
        <h2 className="mt-2 font-heading text-2xl font-medium md:text-3xl">
          サイトができるまで
        </h2>
        <p className="mt-3 text-sm leading-loose text-muted-foreground">
          ご相談から公開・運用まで、一人の窓口で進めます。専門用語はかみ砕いてご説明するので、はじめての方でも安心してお任せください。
        </p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {FLOW.map((step) => (
            <li key={step.no} className="flex gap-4 border p-5">
              <span className="exif-text shrink-0 text-safelight">
                {step.no}
              </span>
              <div>
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* どんなサイトをつくるか */}
      <section className="mb-14">
        <p className="eyebrow">What you get</p>
        <h2 className="mt-2 font-heading text-2xl font-medium md:text-3xl">
          どんなサイトをつくるか
        </h2>
        <p className="mt-3 text-sm leading-loose text-muted-foreground">
          安く見せるためのテンプレート流用ではありません。検索・速度・安全・拡張性まで、長く使えるサイトの土台をはじめから作り込みます。
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {SITE_FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="border p-5">
              <Icon className="size-5 text-safelight" />
              <h3 className="mt-3 text-sm font-semibold">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>

        {/* 標準で入っているもの（具体・宣伝） */}
        <div className="mt-6 border bg-card p-6 md:p-8">
          <h3 className="text-sm font-semibold">
            すべてのサイトに標準で入っているもの
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            追加料金のオプションではなく、最初から含めて作ります（このサイト自身でも使っている仕組みです）。
          </p>
          <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {STANDARD.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs leading-relaxed">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* このサイト自体が実例（最大の売り） */}
      <section className="mb-14 border border-safelight/40 bg-safelight/5 p-6 md:p-8">
        <p className="eyebrow">
          <span className="text-safelight">Showcase</span> / 動いている実例
        </p>
        <h2 className="mt-2 font-heading text-2xl font-medium md:text-3xl">
          このサイト自体が、つくれるものの見本です。
        </h2>
        <p className="mt-4 text-sm leading-loose text-muted-foreground">
          いまご覧いただいているこのサイトは、すべて手づくり。
          <strong className="text-foreground">
            地図から写真をたどる「地図ギャラリー」、撮影データを自動でグラフ化する「EXIF
            ダッシュボード」、現像前後を見比べる「ビフォーアフター」、合言葉で限定公開する「会員ページ」
          </strong>
          ——こうした仕組みも、ご要望に応じてあなたのサイトに組み込めます。カタログではなく、実際に動くものでご判断いただけます。
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href="/gallery"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            地図ギャラリーを見る →
          </Link>
          <Link
            href="/dashboard"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            EXIF ダッシュボードを見る →
          </Link>
          <Link
            href="/collections"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            コレクションを見る →
          </Link>
        </div>
      </section>

      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-lg font-semibold">料金の考え方</h2>
          <p className="text-sm text-muted-foreground">
            撮影プランと Web 制作の料金は
            <Link
              href="/services"
              className="font-medium text-foreground underline underline-offset-4"
            >
              料金・メニュー
            </Link>
            に掲載しています（撮影はプラン別、サイト制作は規模別のお見積り）。
            撮影と Web をまとめてご依頼の場合は、セット価格で個別依頼より割安になります。
            正確な金額は、ご要望をうかがったうえでお見積りをご提示します。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">お支払い</h2>
          <p className="text-sm text-muted-foreground">
            内容をうかがってお見積りを提示し、ご合意のうえでご依頼確定となります。
            お支払いは<strong className="text-foreground">銀行振込</strong>です
            （前金・分割のご相談も内容に応じて承ります）。振込手数料はお客様のご負担と
            させていただいております。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">キャンセル・日程変更</h2>
          <p className="text-sm text-muted-foreground">
            ご予約日程の確定後にキャンセルや日程変更が生じる場合は、できるだけ早めにご連絡ください。
            撮影日に近いキャンセルや、制作着手後のキャンセルについては、進行状況に応じて
            費用を申し受ける場合があります。詳細はご依頼時の取り決めによります。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">納品</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              撮影データ: 撮影後おおむね 1〜3 週間。全カットではなく、撮影時間に応じた枚数（1時間あたり約20枚、うちレタッチ仕上げ10枚）をセレクトしてお渡しします
            </li>
            <li>
              Web サイト: 規模により異なります。お見積り時にスケジュールをご提示します
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">著作権・使用について</h2>
          <p className="text-sm text-muted-foreground">
            納品した写真は、ご依頼の用途の範囲でご自由にお使いいただけます。撮影制作物に
            生成 AI は使用していません。利用範囲のご希望（商用・二次利用等）はお気軽にご相談ください。
          </p>
        </section>
      </div>

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
