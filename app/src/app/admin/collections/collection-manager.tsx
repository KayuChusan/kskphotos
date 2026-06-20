"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Layers,
  Lock,
  KeyRound,
  Copy,
  Check,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  createCollection,
  deleteCollection,
  setCollectionLock,
  createUnlockToken,
  revokeUnlockToken,
} from "./actions";
import type { Collection, UnlockToken } from "@/generated/prisma/client";

type CollectionWithDetail = Collection & {
  _count: { photos: number };
  unlockTokens: UnlockToken[];
};

export function CollectionManager({
  collections,
}: {
  collections: CollectionWithDetail[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newLink, setNewLink] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    try {
      const result = await createCollection(new FormData(e.currentTarget));
      if (!result.ok) throw new Error(result.error);
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(collection: CollectionWithDetail) {
    if (
      !confirm(
        `Delete "${collection.title}"?\n（${collection._count.photos} 枚の写真は未所属に戻ります）`
      )
    )
      return;
    const result = await deleteCollection(collection.id);
    if (!result.ok) alert(result.error);
    router.refresh();
  }

  async function handleLock(collection: CollectionWithDetail) {
    const result = await setCollectionLock(collection.id, !collection.isLocked);
    if (!result.ok) alert(result.error);
    router.refresh();
  }

  async function handleGenerate(collection: CollectionWithDetail) {
    const result = await createUnlockToken(collection.id);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    const link = `${window.location.origin}/u/${result.token}`;
    setNewLink((prev) => ({ ...prev, [collection.id]: link }));
    router.refresh();
  }

  async function handleRevoke(tokenId: string) {
    if (!confirm("この解錠リンクを失効しますか？（押すと使えなくなります）")) return;
    const result = await revokeUnlockToken(tokenId);
    if (!result.ok) alert(result.error);
    router.refresh();
  }

  async function copy(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(link);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <form
        ref={formRef}
        onSubmit={handleCreate}
        className="space-y-4 rounded-lg border p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" placeholder="参院選 2025" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={1}
              placeholder="シリーズの説明"
            />
          </div>
        </div>
        <Button type="submit" size="sm" disabled={creating}>
          <Plus className="mr-1 size-4" />
          {creating ? "Creating..." : "Create Collection"}
        </Button>
      </form>

      {/* List */}
      {collections.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">No collections yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((collection) => {
            const activeTokens = collection.unlockTokens.filter(
              (t) => !t.revoked
            );
            return (
              <div key={collection.id} className="rounded-lg border p-3">
                <div className="flex items-center gap-4">
                  <Layers className="size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate font-medium">
                      {collection.title}
                      {collection.isLocked && (
                        <Badge variant="secondary" className="text-[10px]">
                          <Lock className="mr-1 size-3" />
                          会員限定
                        </Badge>
                      )}
                    </p>
                    {collection.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {collection.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {collection._count.photos} photos
                  </span>
                  <div
                    className="flex shrink-0 items-center gap-1.5"
                    title="会員限定（解錠まで EXIF・現像レシピ・マスク・高画素を出さない）"
                  >
                    <Lock className="size-3.5 text-muted-foreground" />
                    <Switch
                      checked={collection.isLocked}
                      onCheckedChange={() => handleLock(collection)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(collection)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {/* 解錠リンク管理（会員限定のときのみ） */}
                {collection.isLocked && (
                  <div className="mt-3 space-y-2 border-t pt-3 pl-9">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        解錠リンク（note の限定記事に貼る）
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerate(collection)}
                        className="h-7 text-xs"
                      >
                        <KeyRound className="mr-1 size-3" />
                        新しい解錠リンクを発行
                      </Button>
                    </div>

                    {/* 発行直後のリンク（この場でだけ表示） */}
                    {newLink[collection.id] && (
                      <div className="rounded-md border border-safelight/40 bg-safelight/5 p-2">
                        <p className="mb-1 text-[11px] text-safelight">
                          発行しました。この場で控えてください（再表示されません）
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 text-[11px]">
                            {newLink[collection.id]}
                          </code>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7 shrink-0"
                            onClick={() => copy(newLink[collection.id])}
                          >
                            {copied === newLink[collection.id] ? (
                              <Check className="size-3" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 既存トークン一覧（実体は非表示。失効のみ） */}
                    {collection.unlockTokens.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">
                        まだ発行していません。
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {collection.unlockTokens.map((t) => (
                          <li
                            key={t.id}
                            className="flex items-center gap-2 text-[11px] text-muted-foreground"
                          >
                            <KeyRound className="size-3 shrink-0" />
                            <span className="shrink-0">
                              {new Date(t.createdAt).toLocaleDateString("ja-JP")}
                            </span>
                            {t.revoked ? (
                              <Badge variant="outline" className="text-[9px]">
                                失効済み
                              </Badge>
                            ) : (
                              <button
                                onClick={() => handleRevoke(t.id)}
                                className="inline-flex items-center gap-1 text-destructive hover:underline"
                              >
                                <Ban className="size-3" />
                                失効
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {activeTokens.length === 0 &&
                      collection.unlockTokens.length > 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          有効なリンクがありません。新しく発行してください。
                        </p>
                      )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
