"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createService, updateService, deleteService } from "./actions";
import type { Service } from "@/generated/prisma/client";

const CATEGORY_OPTIONS = [
  { value: "POLITICS", label: "政治・選挙" },
  { value: "PORTRAIT", label: "ポートレート" },
  { value: "FAMILY", label: "ファミリー" },
  { value: "EVENT", label: "イベント" },
  { value: "COMMERCIAL", label: "商用・法人" },
  { value: "LOCATION", label: "ロケーション" },
  { value: "WEB_PRODUCTION", label: "Web制作" },
  { value: "IT_SUPPORT", label: "ITサポート" },
];
const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.value, c.label])
);

function ServiceFields({ service }: { service?: Service }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>タイトル *</Label>
          <Input name="title" defaultValue={service?.title} required />
        </div>
        <div className="space-y-1.5">
          <Label>カテゴリ *</Label>
          <select
            name="category"
            defaultValue={service?.category ?? "PORTRAIT"}
            className="block h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>説明 *</Label>
        <Textarea
          name="description"
          rows={2}
          defaultValue={service?.description}
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label>価格(円)</Label>
          <Input
            name="price"
            type="number"
            min={0}
            defaultValue={service?.price ?? 0}
          />
        </div>
        <div className="space-y-1.5">
          <Label>価格補足</Label>
          <Input
            name="priceNote"
            placeholder="〜 / 要相談"
            defaultValue={service?.priceNote ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label>期間/区分</Label>
          <Input
            name="duration"
            placeholder="60分 / 税込"
            defaultValue={service?.duration ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label>並び順</Label>
          <Input
            name="sortOrder"
            type="number"
            defaultValue={service?.sortOrder ?? 0}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>特徴（1行に1項目）</Label>
        <Textarea
          name="features"
          rows={4}
          placeholder={"データ20枚以上\n簡易レタッチ込み"}
          defaultValue={service?.features.join("\n")}
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            value="true"
            defaultChecked={service ? service.isActive : true}
          />
          公開する
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isPopular"
            value="true"
            defaultChecked={service?.isPopular ?? false}
          />
          人気バッジ
        </label>
      </div>
    </div>
  );
}

export function ServicesManager({
  services,
  lockedIds = [],
}: {
  services: Service[];
  lockedIds?: string[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const createRef = useRef<HTMLFormElement>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await createService(new FormData(e.currentTarget));
      if (!result.ok) throw new Error(result.error);
      createRef.current?.reset();
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(
    id: string,
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await updateService(id, new FormData(e.currentTarget));
      if (!result.ok) throw new Error(result.error);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(service: Service) {
    if (!confirm(`「${service.title}」を削除しますか？`)) return;
    const result = await deleteService(service.id);
    if (!result.ok) alert(result.error);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Create */}
      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          ＋ 新しいメニューを追加
        </summary>
        <form ref={createRef} onSubmit={handleCreate} className="mt-4 space-y-4">
          <ServiceFields />
          <Button type="submit" size="sm" disabled={busy}>
            <Plus className="mr-1 size-4" />
            {busy ? "保存中..." : "作成"}
          </Button>
        </form>
      </details>

      {/* List */}
      {services.length === 0 ? (
        <div className="flex min-h-[160px] items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">メニューがありません。</p>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((service) => {
            const priceLabel =
              service.price > 0
                ? `¥${service.price.toLocaleString()}${service.priceNote ?? ""}`
                : service.priceNote ?? "要相談";

            // ソース管理(撮影/制作/保守): コードで一元管理しデプロイで上書き同期するため、
            // ここでは編集・削除させず読み取り専用で表示する。
            if (lockedIds.includes(service.id)) {
              return (
                <div
                  key={service.id}
                  className="rounded-lg border border-dashed p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {service.title}
                      {!service.isActive && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          （非公開）
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <Lock className="size-3" />
                      ソース管理
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {CATEGORY_LABELS[service.category] ?? service.category} ・{" "}
                      {priceLabel}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    料金・納品ポリシーはコード（services-data.ts）で管理しています。変更はソースを編集してデプロイしてください（ここで編集してもデプロイ時に上書きされます）。
                  </p>
                </div>
              );
            }

            return (
              <details key={service.id} className="rounded-lg border p-3">
                <summary className="flex cursor-pointer items-center gap-3">
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {service.title}
                    {!service.isActive && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        （非公開）
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {CATEGORY_LABELS[service.category] ?? service.category} ・{" "}
                    {priceLabel}
                  </span>
                </summary>
                <form
                  onSubmit={(e) => handleUpdate(service.id, e)}
                  className="mt-4 space-y-4"
                >
                  <ServiceFields service={service} />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={busy}>
                      保存
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-1 size-4" />
                      削除
                    </Button>
                  </div>
                </form>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
