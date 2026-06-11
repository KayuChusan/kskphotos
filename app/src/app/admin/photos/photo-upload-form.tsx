"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { createPhoto } from "./actions";
import type { Collection } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

const CATEGORIES = [
  "PORTRAIT",
  "LANDSCAPE",
  "EVENT",
  "STREET",
  "ARCHITECTURE",
  "FOOD",
  "OTHER",
] as const;

export function PhotoUploadForm({
  collections,
}: {
  collections: Collection[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [isPortfolio, setIsPortfolio] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.set("isPublished", String(isPublished));
      formData.set("isPortfolio", String(isPortfolio));

      const result = await createPhoto(formData);
      if (!result.ok) throw new Error(result.error);

      setOpen(false);
      formRef.current?.reset();
      setIsPublished(true);
      setIsPortfolio(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <Upload className="size-4" />
        Upload Photo
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Photo</DialogTitle>
          <DialogDescription>
            写真をアップロードするとEXIFデータが自動抽出されます
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Photo File *</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept="image/*,.arw,.cr2,.cr3,.nef,.dng,.orf,.raf,.rw2"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beforeFile">Before (RAW) File</Label>
            <Input
              id="beforeFile"
              name="beforeFile"
              type="file"
              accept="image/*,.arw,.cr2,.cr3,.nef,.dng,.orf,.raf,.rw2"
            />
            <p className="text-xs text-muted-foreground">
              ビフォーアフター比較用。Lightroomから最小編集のJPEG書き出し推奨
              （ARW等のRAWファイルはブラウザで表示できません）
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" placeholder="Photo title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select name="category" required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {collections.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="collectionId">Collection</Label>
              <select
                id="collectionId"
                name="collectionId"
                className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                defaultValue=""
              >
                <option value="">No collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="撮影場所" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" placeholder="tag1, tag2, tag3" />
            <p className="text-xs text-muted-foreground">
              カンマ区切りで入力
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="developNotes">Develop Notes（現像レシピ）</Label>
            <Textarea
              id="developNotes"
              name="developNotes"
              rows={3}
              placeholder={"露光量 +0.3 / ハイライト -40 / シャドウ +25\nトーンカーブで青を持ち上げ"}
            />
            <p className="text-xs text-muted-foreground">
              Lightroom での調整内容。比較ページに公開されます
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="isPublished"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="isPublished" className="text-sm">
                Published
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isPortfolio"
                checked={isPortfolio}
                onCheckedChange={setIsPortfolio}
              />
              <Label htmlFor="isPortfolio" className="text-sm">
                Portfolio
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
