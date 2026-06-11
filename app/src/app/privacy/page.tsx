import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "プライバシーポリシー — 個人情報の取り扱いについて。",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <p className="eyebrow">Legal</p>
      <h1 className="mb-10 mt-2 font-heading text-5xl font-medium">
        Privacy Policy
      </h1>

      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-semibold">1. 個人情報の収集</h2>
          <p className="text-sm text-muted-foreground">
            当サイトでは、お問い合わせや撮影予約の際に、お名前、メールアドレス、電話番号などの個人情報をお伺いすることがあります。
            これらの情報は、お問い合わせへの回答や撮影業務の遂行にのみ使用いたします。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. 個人情報の利用目的</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>お問い合わせへの回答</li>
            <li>撮影予約の確認・連絡</li>
            <li>撮影データの納品</li>
            <li>サービスの改善</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. 個人情報の第三者提供</h2>
          <p className="text-sm text-muted-foreground">
            法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Cookie の使用</h2>
          <p className="text-sm text-muted-foreground">
            当サイトでは、ユーザー体験の向上やアクセス解析のために Cookie
            を使用する場合があります。
            ブラウザの設定により Cookie の受け入れを拒否することが可能です。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. お問い合わせ</h2>
          <p className="text-sm text-muted-foreground">
            個人情報の取り扱いに関するお問い合わせは、
            <a
              href="/contact"
              className="font-medium text-foreground underline underline-offset-4"
            >
              お問い合わせフォーム
            </a>
            よりご連絡ください。
          </p>
        </section>
      </div>
    </div>
  );
}
