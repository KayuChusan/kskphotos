import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | kskphotos",
  description: "プライバシーポリシー - 個人情報の取り扱いについて。",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">プライバシーポリシー</h1>
      <p className="text-muted-foreground">
        当サイトにおける個人情報の取り扱いについて説明します。
      </p>
    </main>
  );
}
