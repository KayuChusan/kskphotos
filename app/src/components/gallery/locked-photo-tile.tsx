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
import { LockedTile } from "@/components/gallery/locked-tile";
import { NoteUnlockButton } from "@/components/member-gate";

/**
 * 会員限定でマスクされた写真タイル。クリックすると遷移せず、
 * note メンバーシップへ誘導するモーダルを表示する（非会員向けの導線）。
 */
export function LockedPhotoTile({
  blurDataUrl,
  width,
  height,
  className,
  label = "会員限定",
}: {
  blurDataUrl?: string | null;
  width?: number | null;
  height?: number | null;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="会員限定 — note メンバーシップの案内を開く"
        className="block w-full cursor-pointer text-left outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <LockedTile
          blurDataUrl={blurDataUrl}
          width={width}
          height={height}
          className={className}
          label={label}
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="size-4 text-safelight" />
              会員限定コンテンツ
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              この写真は note メンバーシップ限定です。ご参加いただくと、本画像・EXIF・現像レシピ・高画素ダウンロードがご覧いただけます。
            </DialogDescription>
          </DialogHeader>
          <NoteUnlockButton className="mt-2 w-full" />
        </DialogContent>
      </Dialog>
    </>
  );
}
