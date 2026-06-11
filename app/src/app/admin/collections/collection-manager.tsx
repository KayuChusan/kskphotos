"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCollection, deleteCollection } from "./actions";
import type { Collection } from "@/generated/prisma/client";

type CollectionWithCount = Collection & { _count: { photos: number } };

export function CollectionManager({
  collections,
}: {
  collections: CollectionWithCount[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
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

  async function handleDelete(collection: CollectionWithCount) {
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
            <Input
              id="title"
              name="title"
              placeholder="参院選 2025"
              required
            />
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
        <div className="space-y-2">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <Layers className="size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{collection.title}</p>
                {collection.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {collection.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {collection._count.photos} photos
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(collection)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
