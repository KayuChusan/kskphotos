import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | kskphotos",
  description: "お問い合わせ - ご質問やご相談はこちらからお気軽にどうぞ。",
};

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">お問い合わせ</h1>
      <p className="text-muted-foreground">
        ご質問やご相談がございましたら、こちらのフォームからお気軽にお問い合わせください。
      </p>
    </main>
  );
}
