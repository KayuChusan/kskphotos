import type { NextConfig } from "next";

// 全ルート共通のセキュリティヘッダ。
// - clickjacking 対策（X-Frame-Options / frame-ancestors）、MIME スニッフィング抑止、
//   リファラ最小化、不要なブラウザ機能の無効化、HTTPS 固定（HSTS）。
// - CSP は暫定で 'unsafe-inline' を許可（インライン JSON-LD・Next ランタイム・framer の
//   インラインスタイルを壊さないため）。GA4 用に googletagmanager / google-analytics を許可。
//   将来 nonce 方式へ移行して 'unsafe-inline' を外す余地を残す。
// 開発時（next dev）は HMR の WebSocket（ws://localhost:*）を許可する。本番では付けない。
const isDev = process.env.NODE_ENV !== "production";
const connectSrc =
  "connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com https://*.google-analytics.com https://www.googletagmanager.com https://*.basemaps.cartocdn.com" +
  (isDev ? " ws://localhost:* http://localhost:*" : "");

// 'inline-speculation-rules' は <script type="speculationrules"> の先読み最適化のため。
// 開発時のみ 'unsafe-eval'（Next/React dev クライアントが eval/source-map で使用）を許可（本番は付けない）。
const scriptSrc =
  "script-src 'self' 'unsafe-inline' 'inline-speculation-rules' https://www.googletagmanager.com" +
  (isDev ? " 'unsafe-eval'" : "");

const csp = [
  "default-src 'self'",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  scriptSrc,
  // GA4 のビーコン送信先、および maplibre が fetch で取得する CARTO タイルを許可
  connectSrc,
  "font-src 'self'",
  // maplibre-gl は blob: の Web Worker を生成するため許可（地図ビュー）
  "worker-src 'self' blob:",
  // プラグイン（<object>/<embed>）を無効化
  "object-src 'none'",
  // 開発時のみ同一オリジン iframe を許可（/dev-viewport.html のレスポンシブQAハーネス用）。本番は none
  isDev ? "frame-ancestors 'self'" : "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  // 開発時は SAMEORIGIN（QAハーネスの iframe を許可）。本番は DENY
  { key: "X-Frame-Options", value: isDev ? "SAMEORIGIN" : "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  experimental: {
    serverActions: {
      // RAW (ARW) ファイルのアップロードを許容
      bodySizeLimit: "200mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
