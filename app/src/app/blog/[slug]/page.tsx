import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { pageSeo } from "@/lib/seo";
import { BLOG_ENABLED } from "@/lib/feature-flags";
import { Badge } from "@/components/ui/badge";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  if (!BLOG_ENABLED) return [];
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.isPublished) return { title: "記事が見つかりません" };
  return {
    title: post.title,
    description: post.excerpt ?? `${post.title} — KSK Works`,
    ...pageSeo({
      path: `/blog/${slug}`,
      image: post.coverImage,
      type: "article",
      publishedTime: post.publishedAt?.toISOString() ?? null,
    }),
  };
}

function formatDate(d: Date | null) {
  if (!d) return "";
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(d);
}

export default async function BlogPostPage({ params }: Props) {
  if (!BLOG_ENABLED) notFound();
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.isPublished) notFound();

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        ブログ一覧へ
      </Link>

      <header className="mb-10">
        <h1 className="font-heading text-4xl font-medium md:text-5xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
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
      </header>

      {post.excerpt && (
        <p className="mb-8 text-base text-muted-foreground">{post.excerpt}</p>
      )}

      <div className="whitespace-pre-wrap leading-loose text-foreground/90">
        {post.content}
      </div>
    </article>
  );
}
