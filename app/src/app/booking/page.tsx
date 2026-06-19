import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
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
  ...pageSeo({ path: "/booking" }),
  title: "撮影のご依頼",
  description:
    "撮影依頼フォーム — ご要望をお聞かせください。2営業日以内にご連絡いたします。",
};

export const revalidate = 3600;

export default async function BookingPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true },
  });
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
          <BookingForm services={services} />
        </CardContent>
      </Card>
    </div>
  );
}
