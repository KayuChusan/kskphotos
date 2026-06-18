import type { Metadata } from "next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { BookingFlow } from "@/components/home/booking-flow";
import { BookingForm } from "./booking-form";

export const metadata: Metadata = {
  title: "撮影のご依頼",
  description:
    "撮影依頼フォーム — ご要望をお聞かせください。2営業日以内にご連絡いたします。",
};

export default function BookingPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-10 text-center">
        <p className="eyebrow">Reservation</p>
        <h1 className="mt-3 font-heading text-5xl font-medium">撮影のご依頼</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          撮影のご依頼はこちらから。2営業日以内にご連絡いたします。
        </p>
      </div>

      {/* ご依頼の流れ */}
      <section className="mb-14">
        <p className="eyebrow mb-6">
          <span className="text-safelight">●</span> ご依頼の流れ
        </p>
        <BookingFlow />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>ご依頼フォーム</CardTitle>
          <CardDescription>* は必須項目です</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingForm />
        </CardContent>
      </Card>
    </div>
  );
}
