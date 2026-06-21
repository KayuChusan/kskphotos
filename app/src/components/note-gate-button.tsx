"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { NoteUnlockButton } from "@/components/member-gate";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 会員限定の操作ボタン（非会員向け）。クリックで note メンバーシップ誘導モーダルを開く。
 * 高画素ダウンロードなど「会員限定だが存在は見せたい」導線に使う。
 */
export function NoteGateButton({
  label,
  message = "この機能は note メンバーシップ限定です。ご参加いただくと、高画素（4096px）ダウンロード・EXIF・現像レシピがご利用いただけます。",
}: {
  label: string;
  message?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "text-muted-foreground"
        )}
      >
        <Lock className="size-4" />
        {label}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="size-4 text-safelight" />
              会員限定
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              {message}
            </DialogDescription>
          </DialogHeader>
          <NoteUnlockButton className="mt-2 w-full" />
        </DialogContent>
      </Dialog>
    </>
  );
}
