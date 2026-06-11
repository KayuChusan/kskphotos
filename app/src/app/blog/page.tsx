import type { Metadata } from "next";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Blog",
  description: "ブログ — 撮影日記、カメラ・レンズレビュー、撮影テクニック。",
};

const MOCK_POSTS = [
  {
    slug: "sony-a7r4-review",
    title: "Sony α7R IV 1年使用レビュー",
    excerpt:
      "6100万画素の描写力と実用性。1年間使い込んだ率直な感想と作例をご紹介します。",
    date: "2025-12-01",
    categories: ["Review", "Camera"],
  },
  {
    slug: "lightroom-raw-workflow",
    title: "Lightroom RAW現像ワークフロー",
    excerpt:
      "インポートから書き出しまで、効率的なRAW現像の手順をステップバイステップで解説。",
    date: "2025-11-15",
    categories: ["Tutorial", "Software"],
  },
  {
    slug: "tokyo-night-snap",
    title: "東京夜景ストリートスナップ 撮影ガイド",
    excerpt:
      "秋葉原・渋谷・新宿。夜の東京を切り取るための設定とスポット選びのコツ。",
    date: "2025-10-28",
    categories: ["Guide", "Street"],
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-10">
        <p className="eyebrow">Journal</p>
        <h1 className="mt-2 font-heading text-5xl font-medium">Blog</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          撮影日記、機材レビュー、撮影テクニックを発信しています。
        </p>
      </div>

      <div className="space-y-8">
        {MOCK_POSTS.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`} className="block space-y-2">
              <h2 className="font-heading text-2xl font-medium transition-colors group-hover:text-safelight">
                {post.title}
              </h2>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  {post.date}
                </span>
                {post.categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-[10px]">
                    {cat}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
