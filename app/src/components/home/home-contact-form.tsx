"use client";

/**
 * トップ用の相談フォーム — 「受付用紙」。
 * 電気青の面に置く白い紙（.paper で明トークンへ局所復帰）。
 * 送信は /contact と同じ Server Action（ハニーポット・IPレート制限・通知/自動返信込み）。
 */

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact, type ContactState } from "@/app/contact/actions";

const initial: ContactState = { status: "idle" };

export function HomeContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initial);

  return (
    <div className="paper relative w-full max-w-lg shadow-2xl">
      {/* 用紙ヘッダ — 伝票の綴じ */}
      <div className="flex items-center justify-between border-b border-dashed px-6 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="rec-blink mr-2 inline-block text-rec">●</span>
            CONTACT SHEET
          </p>
          <p className="eyebrow-jp mt-0.5">ご相談フォーム — そのまま送れます</p>
        </div>
        <span className="statement-jp -rotate-3 border-2 px-2.5 py-1 text-sm" style={{ borderColor: "var(--rec)", color: "var(--rec-strong)" }}>
          無料
        </span>
      </div>

      {state.status === "success" ? (
        <div className="px-6 py-14 text-center">
          <span className="statement-jp inline-block -rotate-3 border-2 px-4 py-2 text-2xl" style={{ borderColor: "var(--rec)", color: "var(--rec-strong)" }}>
            受付
          </span>
          <p className="statement-jp mt-6 text-xl">{state.message}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            通常2営業日以内にご返信いたします。
          </p>
        </div>
      ) : (
        <form action={formAction} className="space-y-4 px-6 py-6">
          {/* ハニーポット（bot対策・不可視） */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden"
          >
            <label htmlFor="home-company">会社名（入力不要）</label>
            <input
              id="home-company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="home-name">お名前 *</Label>
              <Input id="home-name" name="name" placeholder="山田 太郎" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="home-email">メールアドレス *</Label>
              <Input
                id="home-email"
                name="email"
                type="email"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="home-subject">件名 *</Label>
            <Input
              id="home-subject"
              name="subject"
              placeholder="撮影の相談 / サイトの相談 など"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="home-message">ご相談内容 *</Label>
            <Textarea
              id="home-message"
              name="message"
              placeholder="時期・場所・用途など、分かる範囲で大丈夫です"
              rows={4}
              required
            />
          </div>

          {state.status === "error" && (
            <p className="text-sm text-destructive" role="alert">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="statement-jp inline-flex min-h-14 w-full items-center justify-center text-lg text-white shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {pending ? "送信中…" : "この内容で相談する →"}
          </button>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            お見積り・お打ち合わせのうえで確定します。営業メールはご遠慮ください。
          </p>
        </form>
      )}
    </div>
  );
}
