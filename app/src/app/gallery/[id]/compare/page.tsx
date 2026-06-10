import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Before & After | kskphotos",
  description: "ビフォーアフター比較 - レタッチ前後の写真を比較できます。",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ComparePage({ params }: Props) {
  const { id } = await params;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">ビフォーアフター比較</h1>
      <p className="text-muted-foreground">
        写真ID: {id} のレタッチ前後を比較表示します。
      </p>
    </main>
  );
}
