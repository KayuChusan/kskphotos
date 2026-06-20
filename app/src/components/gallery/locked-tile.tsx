import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 会員限定でマスクされた写真のタイル。本画像 URL は配信せず、保存済みの
 * ぼかしプレースホルダ（blurDataUrl: 16px の data URI）だけを表示する。
 * これにより未解錠ユーザーには本画像が一切渡らない（真の保護）。
 */
export function LockedTile({
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
  const aspectRatio = width && height ? `${width} / ${height}` : undefined;
  return (
    <div
      className={cn("relative overflow-hidden bg-muted", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {blurDataUrl && (
        // 本画像ではなく blur プレースホルダ（data URI）のみ。意図的に <img> を使用。
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blurDataUrl}
          alt=""
          aria-hidden
          className="h-full w-full scale-110 object-cover blur-xl brightness-90"
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/30 text-white">
        <Lock className="size-5" />
        <span className="text-xs tracking-wide">{label}</span>
      </div>
    </div>
  );
}
