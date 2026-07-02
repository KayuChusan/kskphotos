import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageSeo } from "@/lib/seo";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BLOG_ENABLED } from "@/lib/feature-flags";
import { Badge } from "@/components/ui/badge";
import { PageTitle } from "@/components/ui/page-title";

export const metadata: Metadata = {
  ...pageSeo({ path: "/blog" }),
  title: "ブログ",
  description: "ブログ — 撮影日記、カメラ・レンズレビュー、撮影テクニック。",
};

// 静的生成 + 管理更新時のオンデマンド再検証
export const revalidate = 3600;

function formatDate(d: Date | null) {
  if (!d) return "";
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(d);
}

export default async function BlogPage() {
  if (!BLOG_ENABLED) notFound();
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      categories: true,
      publishedAt: true,
    },
  });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-10">
        <PageTitle en="Journal" title="ブログ" />
        <p className="mt-3 text-sm text-muted-foreground">
          撮影日記、機材レビュー、撮影テクニックを発信しています。
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          記事はまだありません。
        </p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="block space-y-2">
                <h2 className="font-heading text-2xl font-medium transition-colors group-hover:text-safelight">
                  {post.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  {post.publishedAt && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      {formatDate(post.publishedAt)}
                    </span>
                  )}
                  {post.categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-[10px]">
                      {cat}
                    </Badge>
                  ))}
                </div>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
