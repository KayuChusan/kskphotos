import { cn } from "@/lib/utils";

/**
 * 下層ページの扉 — 機能名タイトル。
 * トップのタイポグラフィ（ステートメント書体・トリムマーク・REC ドット）に整合させる。
 * ルール: タイトルは機能名そのまま。新しいタグライン・コピーをここに足さない（DESIGN.md コピー体系）。
 */
export function PageTitle({
  en,
  title,
  className,
}: {
  en: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("relative pt-6", className)}>
      <span
        aria-hidden
        className="absolute left-0 top-0 size-5 border-l-2 border-t-2"
        style={{ borderColor: "var(--rec)" }}
      />
      <p className="eyebrow">
        <span className="rec-blink mr-2 inline-block text-rec">●</span>
        {en}
      </p>
      <h1 className="statement-jp mt-3 text-4xl md:text-5xl">{title}</h1>
    </div>
  );
}
