"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
} from "./actions";

export type CaseStudyItem = {
  id: string;
  date: string; // yyyy-mm-dd
  type: "PHOTO" | "WEB" | "IT";
  title: string;
  detail: string | null;
  thumbnailUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  isPublished: boolean;
  sortOrder: number;
};

const TYPE_OPTIONS = [
  { value: "PHOTO", label: "撮影" },
  { value: "WEB", label: "Web 制作" },
  { value: "IT", label: "IT サポート" },
];
const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  TYPE_OPTIONS.map((t) => [t.value, t.label])
);

function Fields({ item }: { item?: CaseStudyItem }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>実施日 *</Label>
          <Input type="date" name="date" defaultValue={item?.date} required />
        </div>
        <div className="space-y-1.5">
          <Label>種別 *</Label>
          <select
            name="type"
            defaultValue={item?.type ?? "WEB"}
            className="block h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>説明（一文）*</Label>
        <Textarea
          name="title"
          rows={2}
          defaultValue={item?.title}
          placeholder="神奈川県議会議員選挙に立候補予定の候補者のホームページを制作しました。"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>補足（任意）</Label>
        <Textarea name="detail" rows={2} defaultValue={item?.detail ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label>サムネイル画像URL（任意）</Label>
        <Input
          name="thumbnailUrl"
          placeholder="/uploads/... または https://..."
          defaultValue={item?.thumbnailUrl ?? ""}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>リンクURL（任意）</Label>
          <Input
            name="linkUrl"
            placeholder="https://..."
            defaultValue={item?.linkUrl ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label>リンク表示名（任意）</Label>
          <Input
            name="linkLabel"
            placeholder="サイトを見る"
            defaultValue={item?.linkLabel ?? ""}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="space-y-1.5">
          <Label>並び順</Label>
          <Input
            name="sortOrder"
            type="number"
            className="w-24"
            defaultValue={item?.sortOrder ?? 0}
          />
        </div>
        <label className="flex items-center gap-2 pt-5 text-sm">
          <input
            type="checkbox"
            name="isPublished"
            value="true"
            defaultChecked={item ? item.isPublished : true}
          />
          公開する（掲載許可済み）
        </label>
      </div>
    </div>
  );
}

export function CaseStudiesManager({ items }: { items: CaseStudyItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const createRef = useRef<HTMLFormElement>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await createCaseStudy(new FormData(e.currentTarget));
      if (!result.ok) throw new Error(result.error);
      createRef.current?.reset();
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await updateCaseStudy(id, new FormData(e.currentTarget));
      if (!result.ok) throw new Error(result.error);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item: CaseStudyItem) {
    if (!confirm(`「${item.title}」を削除しますか？`)) return;
    const result = await deleteCaseStudy(item.id);
    if (!result.ok) alert(result.error);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          ＋ 新しい実績を追加
        </summary>
        <form ref={createRef} onSubmit={handleCreate} className="mt-4 space-y-4">
          <Fields />
          <Button type="submit" size="sm" disabled={busy}>
            <Plus className="mr-1 size-4" />
            {busy ? "保存中..." : "作成"}
          </Button>
        </form>
      </details>

      {items.length === 0 ? (
        <div className="flex min-h-[160px] items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">実績がありません。</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <details key={item.id} className="rounded-lg border p-3">
              <summary className="flex cursor-pointer items-center gap-3">
                <span className="min-w-0 flex-1 truncate font-medium">
                  {item.title}
                  {!item.isPublished && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      （非公開）
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {TYPE_LABELS[item.type] ?? item.type} ・ {item.date}
                </span>
              </summary>
              <form
                onSubmit={(e) => handleUpdate(item.id, e)}
                className="mt-4 space-y-4"
              >
                <Fields item={item} />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={busy}>
                    保存
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-1 size-4" />
                    削除
                  </Button>
                </div>
              </form>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
