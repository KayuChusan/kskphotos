import type { JsonLdNode } from "@/lib/structured-data";

/**
 * JSON-LD 構造化データを <script type="application/ld+json"> として注入する。
 * 単一ノード or 配列（複数ノード）を受け付ける。サーバーコンポーネント。
 * ここに渡すのは structured-data.ts で組んだ静的オブジェクトのみ（ユーザー入力を直接入れない）。
 */
export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  // DB 由来の値（写真タイトル・プロフィール名等）に "</script>" が含まれると script を
  // 抜け出して HTML/JS を注入できてしまうため、"<" を Unicode エスケープして breakout を防ぐ。
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
