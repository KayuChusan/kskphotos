"use client";

import { useActionState } from "react";
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
import { submitBooking, type BookingState } from "./actions";

const initial: BookingState = { status: "idle" };

export function BookingForm() {
  const [state, formAction, pending] = useActionState(submitBooking, initial);

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-safelight/40 bg-safelight/5 p-6 text-center">
        <p className="font-heading text-lg">{state.message}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          お急ぎの場合は info@kskworks.jp までご連絡ください。
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">お名前 *</Label>
          <Input id="name" name="name" placeholder="山田 太郎" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email@example.com"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">電話番号</Label>
          <Input id="phone" name="phone" type="tel" placeholder="090-1234-5678" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service">撮影プラン *</Label>
          <Select name="plan">
            <SelectTrigger id="service" className="w-full">
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
          <Input id="date" name="date" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">撮影場所</Label>
          <Input id="location" name="location" placeholder="東京都渋谷区..." />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">ご要望・備考</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="撮影イメージや人数、衣装の相談など"
          rows={5}
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "送信中…" : "この内容で依頼する"}
      </Button>
    </form>
  );
}
