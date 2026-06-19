import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Camera, Globe, RefreshCw, Wrench } from "lucide-react";
import { pageSeo } from "@/lib/seo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  ...pageSeo({ path: "/guide" }),
  title: "ご利用案内",
  description:
    "撮影とWebサイトをまとめて任せられるワンストップ対応。料金の考え方・お支払い・キャンセル・納品について。新規制作から運用・既存サイトの引き継ぎ・リニューアルまで。",
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
    body: "公開後の更新作業、ドメイン・サーバー・SSL の管理、障害時の一次対応まで継続でサポート。",
  },
  {
    icon: RefreshCw,
    title: "引き継ぎ・リニューアル",
    body: "他社制作・自作サイトの運用引き継ぎや、デザイン刷新・表示速度/スマホ対応の改善にも対応。",
  },
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
              撮影データ: 撮影後おおむね 1〜3 週間（プラン・カット数により前後します）
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
