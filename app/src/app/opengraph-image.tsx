import { ImageResponse } from "next/og";

export const alt = "KSK Works — 出張撮影・ポートレート";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 暗室トーンのブランドOGP（外部アセット不要・ImageResponse で動的生成）
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(120% 120% at 0% 0%, #2a2622 0%, #15120f 55%, #0d0b09 100%)",
          color: "#f5efe6",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 26,
            letterSpacing: 8,
            color: "#e0b46a",
            textTransform: "uppercase",
          }}
        >
          <span style={{ fontSize: 22 }}>●</span>
          Photography / Web / IT
        </div>
        <div style={{ fontSize: 132, fontWeight: 600, marginTop: 24 }}>
          KSK Works
        </div>
        <div
          style={{
            fontSize: 40,
            fontStyle: "italic",
            color: "#cfc6b8",
            marginTop: 8,
          }}
        >
          Capturing moments, telling stories
        </div>
        <div style={{ fontSize: 30, color: "#a89e8e", marginTop: 40 }}>
          出張撮影・ポートレート ｜ 神奈川拠点・全国対応
        </div>
      </div>
    ),
    { ...size }
  );
}
