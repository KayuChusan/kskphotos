/**
 * 筆致（ブラシストローク）— feTurbulence でエッジを荒らした色面。
 * 「手の痕跡」の署名意匠。装飾は少量・意味のある場所（制作物の背後・帯の縁）にだけ使う。
 * サーバーコンポーネント可（純 SVG）。id はインスタンス毎に一意にする。
 */
export function BrushStroke({
  id,
  className,
  color = "var(--brand-blue)",
  opacity = 1,
}: {
  id: string;
  className?: string;
  color?: string;
  opacity?: number;
}) {
  const filterId = `brush-${id}`;
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 400 120"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-40%" width="140%" height="180%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035 0.12"
            numOctaves="3"
            seed="7"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="26" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <rect
          x="14"
          y="26"
          width="372"
          height="68"
          fill={color}
          opacity={opacity}
        />
        {/* かすれ — 尻尾側に小さな飛沫 */}
        <rect x="330" y="40" width="58" height="12" fill={color} opacity={opacity * 0.7} />
        <rect x="6" y="52" width="26" height="10" fill={color} opacity={opacity * 0.6} />
      </g>
    </svg>
  );
}
