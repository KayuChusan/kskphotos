import { cn } from "@/lib/utils";

/**
 * セクションの計器ヘッダ — フィルムカウンター風の大判番号(mono)＋ティック罫＋ラベル。
 * 全ページ共通の署名意匠として、各セクション冒頭の eyebrow を置き換える。
 */
export function SectionMark({
  no,
  label,
  className,
}: {
  no: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="font-mono text-3xl font-medium leading-none text-safelight tabular-nums md:text-4xl">
        {no}
      </span>
      <span className="flex items-center gap-2 pt-1">
        <span aria-hidden className="h-px w-7 bg-border" />
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          {label}
        </span>
      </span>
    </div>
  );
}
