import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | kskphotos",
  description: "撮影メニュー・料金 - 各種撮影プランと料金をご案内します。",
};

export default function ServicesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">撮影メニュー・料金</h1>
      <p className="text-muted-foreground">
        各種撮影プランと料金の一覧です。ご要望に合わせたプランをお選びいただけます。
      </p>
    </main>
  );
}
