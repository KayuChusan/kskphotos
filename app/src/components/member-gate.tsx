import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** note メンバーシップの参加・解錠導線。後で変えやすいよう一箇所で管理する。 */
export const NOTE_MEMBERSHIP_URL = "https://note.com/anive2768/membership";

/** note メンバーシップへ誘導する解錠ボタン（外部リンク）。 */
export function NoteUnlockButton({
  className,
  label = "note メンバーシップで解錠",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={NOTE_MEMBERSHIP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ size: "sm" }), className)}
    >
      {label}
    </a>
  );
}

/**
 * 会員限定機能のマスク表示。「非表示」にせず「〜は会員限定です」と見せ、
 * note への参加・解錠へ誘導する。写真詳細・比較ページの EXIF/現像/高画素枠に使う。
 */
export function MemberGate({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-border/60 p-5 text-center">
      <Lock className="mx-auto mb-2 size-5 text-muted-foreground" />
      <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
      <NoteUnlockButton className="mt-4" />
    </div>
  );
}
