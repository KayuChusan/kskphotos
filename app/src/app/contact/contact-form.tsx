"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitContact, type ContactState } from "./actions";

const initial: ContactState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initial);

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-safelight/40 bg-safelight/5 p-6 text-center">
        <p className="font-heading text-lg">{state.message}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          通常2営業日以内にご返信いたします。
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
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
      <div className="space-y-2">
        <Label htmlFor="subject">件名 *</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="お問い合わせの件名"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">メッセージ *</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="お問い合わせ内容をご記入ください"
          rows={6}
          required
        />
      </div>
      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "送信中…" : "送信する"}
      </Button>
    </form>
  );
}
