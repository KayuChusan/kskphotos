import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking | kskphotos",
  description: "撮影依頼フォーム - 撮影のご依頼はこちらからお申し込みください。",
};

export default function BookingPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">撮影依頼フォーム</h1>
      <p className="text-muted-foreground">
        撮影のご依頼はこちらのフォームからお申し込みください。内容を確認後、折り返しご連絡いたします。
      </p>
    </main>
  );
}
