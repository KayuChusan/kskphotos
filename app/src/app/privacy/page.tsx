import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { pageSeo } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageSeo({ path: "/privacy" }),
  title: "プライバシーポリシー",
  description:
    "プライバシーポリシー — KSK Works における個人情報の取り扱いについて。",
};

const LAST_UPDATED = "2026年6月30日";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <p className="eyebrow">Legal</p>
      <h1 className="mb-3 mt-2 font-heading text-5xl font-medium">
        プライバシーポリシー
      </h1>
      <p className="mb-10 text-xs text-muted-foreground">
        最終改定日: {LAST_UPDATED}
      </p>

      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-6">
        <p className="text-sm text-muted-foreground">
          KSK Works（以下「当サイト」）は、撮影サービスのご提供にあたり取得する個人情報を、
          以下の方針に基づき適切に取り扱います。
        </p>

        <section>
          <h2 className="text-lg font-semibold">1. 運営者</h2>
          <ul className="list-none space-y-1 pl-0 text-sm text-muted-foreground">
            <li>運営者: KSK Works</li>
            <li>
              連絡先:{" "}
              <Link
                href="/contact"
                className="font-medium text-foreground underline underline-offset-4"
              >
                お問い合わせフォーム
              </Link>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. 取得する個人情報</h2>
          <p className="text-sm text-muted-foreground">
            当サイトでは、各フォームのご利用時に以下の情報を取得します。
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              お問い合わせフォーム: お名前、メールアドレス、件名、お問い合わせ内容
            </li>
            <li>
              撮影のご依頼フォーム:
              お名前、メールアドレス、電話番号（任意）、ご希望の撮影プラン・日時・場所、ご要望内容
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. 利用目的</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>お問い合わせへの回答・ご連絡</li>
            <li>撮影のご依頼・ご予約の確認および調整</li>
            <li>撮影業務の遂行および撮影データの納品</li>
            <li>サービスの維持・改善</li>
            <li>法令に基づく対応</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. 第三者への提供</h2>
          <p className="text-sm text-muted-foreground">
            次の場合を除き、ご本人の同意なく個人情報を第三者に提供することはありません。
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>法令に基づく場合</li>
            <li>人の生命・身体・財産の保護に必要で、本人の同意取得が困難な場合</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. 業務委託・外部サービスの利用</h2>
          <p className="text-sm text-muted-foreground">
            当サイトの運営にあたり、サーバー・データ保管・メール送受信などについて外部の
            クラウドサービスを利用する場合があります。その際は、利用目的の達成に必要な範囲で、
            委託先を適切に管理します。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            6. Cookie とアクセス解析（外部送信について）
          </h2>
          <p className="text-sm text-muted-foreground">
            当サイトでは、管理者のログイン状態を保持する目的のほか、サイトの利用状況を把握し
            サービスを改善する目的で、Google LLC が提供するアクセス解析ツール「Google
            Analytics 4」を利用しています。同ツールは Cookie
            を用いて利用者の閲覧情報を収集します。
          </p>
          <p className="text-sm text-muted-foreground">
            電気通信事業法（外部送信規律）に基づき、利用者の端末から外部へ送信される情報を
            以下のとおり公表します。
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>送信先: Google LLC（Google Analytics 4）</li>
            <li>
              送信される情報: Cookie 識別子、閲覧したページの URL・参照元、IP
              アドレス、ブラウザ・端末・OS の種類、おおよその地域、アクセス日時など
            </li>
            <li>利用目的: サイトの利用状況の分析およびサービスの改善</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            収集された情報は Google のプライバシーポリシーに基づき管理されます（
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4"
            >
              policies.google.com/privacy
            </a>
            ）。Cookie はブラウザの設定により拒否でき、また「
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Google アナリティクス オプトアウト アドオン
            </a>
            」により Google Analytics による収集を無効化できます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. 安全管理</h2>
          <p className="text-sm text-muted-foreground">
            取得した個人情報の漏えい・滅失・毀損の防止その他の安全管理のために、必要かつ適切な
            措置を講じます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            8. 開示・訂正・削除等のご請求
          </h2>
          <p className="text-sm text-muted-foreground">
            ご本人からの個人情報の開示・訂正・利用停止・削除等のご請求には、ご本人であることを
            確認のうえ、合理的な範囲で速やかに対応します。ご請求は
            <Link
              href="/contact"
              className="font-medium text-foreground underline underline-offset-4"
            >
              お問い合わせフォーム
            </Link>
            よりご連絡ください。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">9. 本ポリシーの改定</h2>
          <p className="text-sm text-muted-foreground">
            当サイトは、必要に応じて本ポリシーを改定することがあります。改定後の内容は、
            本ページに掲載した時点から効力を生じます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">10. お問い合わせ窓口</h2>
          <p className="text-sm text-muted-foreground">
            個人情報の取り扱いに関するお問い合わせは、
            <Link
              href="/contact"
              className="font-medium text-foreground underline underline-offset-4"
            >
              お問い合わせフォーム
            </Link>
            よりご連絡ください。
          </p>
        </section>
      </div>
    </div>
  );
}
