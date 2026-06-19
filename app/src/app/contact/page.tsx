import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import { Mail, MapPin } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  ...pageSeo({ path: "/contact" }),
  title: "お問い合わせ",
  description: "お問い合わせ — ご質問やご相談はお気軽にどうぞ。",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10 text-center">
        <p className="eyebrow">Get in Touch</p>
        <h1 className="mt-3 font-heading text-5xl font-medium">お問い合わせ</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          お気軽にお問い合わせください。
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <CardTitle>メッセージを送る</CardTitle>
            <CardDescription>通常2営業日以内にご返信いたします。</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Mail className="mt-1 size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">メール</p>
              <p className="text-sm text-muted-foreground">info@kskworks.jp</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">対応エリア</p>
              <p className="text-sm text-muted-foreground">
                神奈川・東京を中心に出張対応
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
