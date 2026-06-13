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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CountUp } from "@/components/count-up";
import type { Photo } from "@/generated/prisma/client";

// セーフライト + モノクロ濃淡のみ — サイト全体のトーンに合わせる
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const CATEGORY_LABELS: Record<string, string> = {
  PORTRAIT: "ポートレート",
  LANDSCAPE: "風景",
  EVENT: "イベント",
  STREET: "スナップ",
  ARCHITECTURE: "建築",
  FOOD: "フード",
  OTHER: "その他",
};

function countBy<T>(items: T[], key: (item: T) => string | null) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    if (k) counts[k] = (counts[k] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function LensDistribution({ photos }: { photos: Photo[] }) {
  const data = countBy(photos, (p) => p.lensModel);
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
            <Tooltip />
            <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function CategoryBreakdown({ photos }: { photos: Photo[] }) {
  const data = countBy(photos, (p) => CATEGORY_LABELS[p.category] ?? p.category);
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
            >
              {data.map((_entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function FocalLengthVsAperture({ photos }: { photos: Photo[] }) {
  const data = photos
    .filter((p) => p.focalLength != null && p.aperture != null)
    .map((p) => ({
      focalLength: p.focalLength,
      aperture: p.aperture,
      title: p.title,
    }));
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
            <Tooltip />
            <Scatter data={data} fill="var(--chart-1)" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function IsoDistribution({ photos }: { photos: Photo[] }) {
  const buckets = [
    { label: "100", min: 0, max: 100 },
    { label: "200-400", min: 101, max: 400 },
    { label: "800-1600", min: 401, max: 1600 },
    { label: "3200+", min: 1601, max: Infinity },
  ];
  const data = buckets.map((b) => ({
    name: b.label,
    count: photos.filter(
      (p) => p.iso != null && p.iso >= b.min && p.iso <= b.max
    ).length,
  }));

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
            <Tooltip />
            <Bar dataKey="count" fill="var(--chart-3)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ExifDashboard({ photos }: { photos: Photo[] }) {
  const uniqueLenses = new Set(
    photos.filter((p) => p.lensModel).map((p) => p.lensModel)
  ).size;
  const uniqueLocations = new Set(
    photos.filter((p) => p.location).map((p) => p.location)
  ).size;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="font-heading text-5xl font-medium">
              <CountUp value={photos.length} />
            </p>
            <p className="eyebrow mt-2">総撮影枚数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-heading text-5xl font-medium">
              <CountUp value={uniqueLenses} />
            </p>
            <p className="eyebrow mt-2">使用レンズ数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-heading text-5xl font-medium">
              <CountUp value={uniqueLocations} />
            </p>
            <p className="eyebrow mt-2">撮影場所数</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LensDistribution photos={photos} />
        <CategoryBreakdown photos={photos} />
        <FocalLengthVsAperture photos={photos} />
        <IsoDistribution photos={photos} />
      </div>
    </div>
  );
}
