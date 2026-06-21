"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import { useReducedMotion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CountUp } from "@/components/count-up";

// 集計済みデータのみを受け取る（会員限定写真の個別 EXIF はサーバーで集計し
// クライアントへは出さない＝ペイロードから member EXIF を復元できない）。
type Dist = { name: string; count: number };
type ScatterPoint = { focalLength: number; aperture: number; title: string };

// アクセント(琥珀)はデータの「最重要1点」専用、それ以外は低彩度ニュートラルに寄せる
const ACCENT = "var(--chart-1)"; // セーフライト琥珀 — 強調1点のみ
const NEUTRAL = "var(--chart-3)"; // 低彩度ニュートラル — データ系列の主役
// 円グラフ用の濃淡ランプ(先頭=最大スライスに琥珀、以降はニュートラル濃淡)
const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// Tooltip を印画紙トーン(ポップオーバー面 + モノスペース)に統一
const TOOLTIP_PROPS = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 0,
    fontSize: 11,
    fontFamily: "var(--font-geist-mono), monospace",
    color: "var(--popover-foreground)",
  },
  itemStyle: { color: "var(--popover-foreground)" },
  labelStyle: { color: "var(--muted-foreground)" },
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  PORTRAIT: "ポートレート",
  LANDSCAPE: "風景",
  EVENT: "イベント",
  STREET: "スナップ",
  ARCHITECTURE: "建築",
  FOOD: "フード",
  OTHER: "その他",
};

function LensDistribution({ data }: { data: Dist[] }) {
  const reduced = useReducedMotion();
  if (data.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>レンズ使用率</CardTitle>
        <CardDescription>撮影枚数の多いレンズ順</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={180}
              tick={{ fontSize: 11 }}
            />
            <Tooltip {...TOOLTIP_PROPS} />
            {/* 最頻レンズ(先頭)だけ琥珀で強調、他はニュートラル */}
            <Bar dataKey="count" radius={[0, 2, 2, 0]} isAnimationActive={!reduced}>
              {data.map((_entry, i) => (
                <Cell key={i} fill={i === 0 ? ACCENT : NEUTRAL} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function CategoryBreakdown({ data: raw }: { data: Dist[] }) {
  const reduced = useReducedMotion();
  // サーバーは生のカテゴリ enum で集計するため、ここで日本語ラベルに変換
  const data = raw.map((d) => ({
    name: CATEGORY_LABELS[d.name] ?? d.name,
    count: d.count,
  }));
  if (data.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>カテゴリー比率</CardTitle>
        <CardDescription>被写体ジャンルごとの割合</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
              isAnimationActive={!reduced}
            >
              {data.map((_entry, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP_PROPS} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function FocalLengthVsAperture({ data }: { data: ScatterPoint[] }) {
  const reduced = useReducedMotion();
  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>焦点距離 × 絞り</CardTitle>
        <CardDescription>1枚ごとの撮影設定の分布</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="focalLength"
              name="Focal Length"
              unit="mm"
              type="number"
            />
            <YAxis
              dataKey="aperture"
              name="Aperture"
              type="number"
              reversed
              tickFormatter={(v: number) => `f/${v}`}
            />
            <Tooltip {...TOOLTIP_PROPS} />
            {/* 単一系列のためニュートラル(琥珀の二重使用を避ける) */}
            <Scatter data={data} fill={NEUTRAL} isAnimationActive={!reduced} />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function IsoDistribution({ data }: { data: Dist[] }) {
  const reduced = useReducedMotion();

  return (
    <Card>
      <CardHeader>
        <CardTitle>ISO感度の分布</CardTitle>
        <CardDescription>感度帯ごとの撮影枚数</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip {...TOOLTIP_PROPS} />
            <Bar
              dataKey="count"
              fill={NEUTRAL}
              radius={[2, 2, 0, 0]}
              isAnimationActive={!reduced}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ExifDashboard({
  totalCount,
  uniqueLenses,
  uniqueLocations,
  lensDist,
  categoryDist,
  isoDist,
  scatter,
}: {
  totalCount: number;
  uniqueLenses: number;
  uniqueLocations: number;
  lensDist: Dist[];
  categoryDist: Dist[];
  isoDist: Dist[];
  scatter: ScatterPoint[];
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="font-heading text-5xl font-medium">
              <CountUp value={totalCount} />
            </p>
            <p className="eyebrow-jp mt-2">総撮影枚数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-heading text-5xl font-medium">
              <CountUp value={uniqueLenses} />
            </p>
            <p className="eyebrow-jp mt-2">使用レンズ数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-heading text-5xl font-medium">
              <CountUp value={uniqueLocations} />
            </p>
            <p className="eyebrow-jp mt-2">撮影場所数</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LensDistribution data={lensDist} />
        <CategoryBreakdown data={categoryDist} />
        <FocalLengthVsAperture data={scatter} />
        <IsoDistribution data={isoDist} />
      </div>
    </div>
  );
}
