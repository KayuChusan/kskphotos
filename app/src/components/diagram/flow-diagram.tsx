import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { JaText } from "@/components/ui/ja-text";

export type FlowNode = {
  label: string;
  sub?: string;
  /** goal=到達点(琥珀) / process=過程(現像液シアン) */
  tone?: "process" | "goal";
};

/**
 * 工程の流れ図。ノード間を「琥珀→青緑→シアン」の温度グラデ線で繋ぎ、
 * 暖（到達点）×冷（過程）の二灯で工程の温度遷移を表す署名意匠。
 * モバイルは縦、sm 以上は横。和文は JaText（文節折り）。reduced-motion 安全（動きなし）。
 */
export function FlowDiagram({
  nodes,
  ariaLabel,
  className,
}: {
  nodes: FlowNode[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={cn(
        "flex flex-col items-stretch sm:flex-row sm:items-center",
        className
      )}
    >
      {nodes.map((n, i) => (
        <Fragment key={`${n.label}-${i}`}>
          <div
            role="listitem"
            className="rounded-lg bg-card-warm px-4 py-3 text-center shadow-sm ring-1 ring-foreground/5 sm:flex-1"
          >
            <span
              aria-hidden
              className={cn(
                "mx-auto block size-1.5 rounded-full",
                n.tone === "goal" ? "bg-safelight" : "bg-coolant"
              )}
            />
            <span className="mt-2 block text-sm font-medium">
              <JaText>{n.label}</JaText>
            </span>
            {n.sub && (
              <span className="mt-0.5 block text-xs text-muted-foreground">
                <JaText>{n.sub}</JaText>
              </span>
            )}
          </div>
          {i < nodes.length - 1 && (
            <span
              aria-hidden
              className="mx-auto my-1 h-5 w-0.5 shrink-0 rounded bg-gradient-to-b from-[var(--safelight)] via-[var(--tide)] to-[var(--coolant)] sm:mx-2 sm:my-0 sm:h-0.5 sm:w-8 sm:bg-gradient-to-r"
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
