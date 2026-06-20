/**
 * Lightroom の現像設定（XMP の crs: 名前空間）を解析し、人が読める日本語テキストに整形する。
 *
 * - 入力は RAW のサイドカー `.xmp`（Lightroom の「メタデータをファイルに保存」や
 *   「元画像」書き出しで生成される XML）。書き出し JPEG には現像設定は入らないため非対応。
 * - crs フィールドは Lightroom が rdf:Description の「属性」として書き出すことが多いので
 *   属性形式を主に解析し、トーンカーブ/HSL/マスク等は「有無」を要約表示する。
 * - クライアント・サーバー双方から使えるよう、外部依存のない純粋関数にしている。
 */

const HEADER = "── 現像設定（Lightroom / .xmp）──";

/** crs: 属性をすべて抽出（例: crs:Exposure2012="+0.35"） */
export function parseCrsAttributes(xmp: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!xmp) return out;
  const re = /crs:([A-Za-z0-9_]+)\s*=\s*"([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xmp)) !== null) {
    out[m[1]] = m[2];
  }
  // 要素形式 <crs:Field>value</crs:Field> も拾う（属性が無い書き出し対策）
  const reEl = /<crs:([A-Za-z0-9_]+)>([^<]*)<\/crs:[A-Za-z0-9_]+>/g;
  while ((m = reEl.exec(xmp)) !== null) {
    if (out[m[1]] === undefined) out[m[1]] = m[2].trim();
  }
  return out;
}

/** 数値文字列が「実質ゼロでない」か（0 / +0.00 などは無視） */
function isNonZero(v: string | undefined): v is string {
  if (v === undefined || v === "") return false;
  const n = Number(v);
  if (Number.isNaN(n)) return false;
  return n !== 0;
}

/** 正の数で符号が無ければ + を付けて見やすくする */
function signed(v: string): string {
  const n = Number(v);
  if (!Number.isNaN(n) && n > 0 && !v.trim().startsWith("+")) return `+${v}`;
  return v;
}

const WB_LABELS: Record<string, string> = {
  "As Shot": "撮影時",
  Auto: "オート",
  Custom: "カスタム",
  Daylight: "太陽光",
  Cloudy: "曇天",
  Shade: "日陰",
  Tungsten: "電球",
  Fluorescent: "蛍光灯",
  Flash: "フラッシュ",
};

// 値あり項目: crs フィールド名 → 日本語ラベル（基本補正）
const BASIC: [string, string][] = [
  ["Exposure2012", "露光量"],
  ["Contrast2012", "コントラスト"],
  ["Highlights2012", "ハイライト"],
  ["Shadows2012", "シャドウ"],
  ["Whites2012", "白レベル"],
  ["Blacks2012", "黒レベル"],
];
const PRESENCE: [string, string][] = [
  ["Texture", "テクスチャ"],
  ["Clarity2012", "明瞭度"],
  ["Dehaze", "かすみの除去"],
  ["Vibrance", "自然な彩度"],
  ["Saturation", "彩度"],
];
const DETAIL: [string, string][] = [
  ["Sharpness", "シャープ"],
  ["LuminanceSmoothing", "輝度ノイズ軽減"],
  ["ColorNoiseReduction", "カラーノイズ軽減"],
];

function joinPairs(crs: Record<string, string>, pairs: [string, string][]): string {
  return pairs
    .filter(([k]) => isNonZero(crs[k]))
    .map(([k, label]) => `${label} ${signed(crs[k])}`)
    .join(" / ");
}

/** 値のある補正行（WB・基本・演出・ディテール）を組み立てる */
function valueLines(crs: Record<string, string>): string[] {
  const lines: string[] = [];
  const wbParts: string[] = [];
  if (crs.WhiteBalance) wbParts.push(WB_LABELS[crs.WhiteBalance] ?? crs.WhiteBalance);
  if (crs.Temperature && crs.WhiteBalance && crs.WhiteBalance !== "As Shot") {
    wbParts.push(`${crs.Temperature}K`);
  } else if (isNonZero(crs.Temperature)) {
    wbParts.push(`${crs.Temperature}K`);
  }
  if (isNonZero(crs.Tint)) wbParts.push(`色かぶり ${signed(crs.Tint)}`);
  if (wbParts.length) lines.push(`WB: ${wbParts.join(" / ")}`);

  const basic = joinPairs(crs, BASIC);
  if (basic) lines.push(basic);
  const presence = joinPairs(crs, PRESENCE);
  if (presence) lines.push(presence);
  const detail = joinPairs(crs, DETAIL);
  if (detail) lines.push(detail);
  return lines;
}

/**
 * 有無フラグ。トーンカーブ・マスクは Lightroom がネストした RDF コンテナ
 * （`<crs:ToneCurvePV2012><rdf:Seq>…`）で書き出すため、属性マップではなく生 XMP を走査する。
 */
function flagList(crs: Record<string, string>, xmp: string): string[] {
  const flags: string[] = [];
  if (xmp) {
    // トーンカーブ: 既定(Linear)以外の名前が付いていれば調整ありとみなす
    const tc = /crs:ToneCurveName2012\s*=\s*"([^"]*)"/.exec(xmp);
    if (tc && tc[1] && !/^linear$/i.test(tc[1])) flags.push("トーンカーブ調整");
    // マスク（局所補正）
    if (/MaskGroupBasedCorrections|CorrectionMasks|crs:Masks\b/.test(xmp))
      flags.push("マスク（局所補正）");
  }
  const hslKeys = Object.keys(crs).filter((k) =>
    /^(Hue|Saturation|Luminance)Adjustment/.test(k)
  );
  if (hslKeys.some((k) => isNonZero(crs[k]))) flags.push("HSL調整");
  if (crs.ConvertToGrayscale === "True") flags.push("モノクロ変換");
  if (crs.LensProfileEnable === "1" || crs.LensProfileEnable === "True")
    flags.push("レンズ補正");
  if (isNonZero(crs.PostCropVignetteAmount)) flags.push("周辺光量補正");
  return [...new Set(flags)];
}

function build(crs: Record<string, string>, xmp: string): string {
  const lines = valueLines(crs);
  const flags = flagList(crs, xmp);
  if (flags.length) lines.push(flags.join(" / "));
  if (!lines.length) return "";
  return [HEADER, ...lines].join("\n");
}

/** crs マップ（属性ベース）から整形。ネスト要素のフラグは含めない。 */
export function formatDevelopSettingsFromCrs(crs: Record<string, string>): string {
  return build(crs, "");
}

/** XMP テキストから現像設定テキストを生成（該当無しは空文字） */
export function formatDevelopSettings(xmp: string): string {
  return build(parseCrsAttributes(xmp), xmp);
}

/**
 * 既存メモに抽出テキストを「後ろに追記」する。
 * - 抽出が空なら既存のまま。
 * - 既存が空なら抽出のみ。
 * - どちらもあれば空行を挟んで連結。
 */
export function mergeDevelopNotes(existing: string, extracted: string): string {
  if (!extracted) return existing;
  if (!existing || !existing.trim()) return extracted;
  return `${existing.trimEnd()}\n\n${extracted}`;
}
