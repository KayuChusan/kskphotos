import type { Metadata } from "next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { BookingFlow } from "@/components/home/booking-flow";

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
          <form className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">お名前 *</Label>
                <Input id="name" placeholder="山田 太郎" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input id="phone" type="tel" placeholder="090-1234-5678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">撮影プラン *</Label>
                <Select>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="プランを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profile">
                      政治・選挙(プロフィール / ポスター / 記録)
                    </SelectItem>
                    <SelectItem value="portrait">ポートレート</SelectItem>
                    <SelectItem value="family">ファミリー / カップル</SelectItem>
                    <SelectItem value="event">イベント</SelectItem>
                    <SelectItem value="commercial">商用・法人</SelectItem>
                    <SelectItem value="web">サイト制作・IT サポート</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">撮影希望日</Label>
                <Input id="date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">撮影場所</Label>
                <Input id="location" placeholder="東京都渋谷区..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">ご要望・備考</Label>
              <Textarea
                id="message"
                placeholder="撮影イメージや人数、衣装の相談など"
                rows={5}
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              この内容で依頼する
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
