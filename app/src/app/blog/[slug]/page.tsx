import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | KSK Works",
  description: "ブログ記事詳細 - 記事の本文を表示します。",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">ブログ記事</h1>
      <p className="text-muted-foreground">
        記事スラッグ: {slug} の詳細ページです。
      </p>
    </main>
  );
}
