"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "./actions";
import type { ProfileContent } from "@/lib/profile";

export function ProfileManager({ profile }: { profile: ProfileContent }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await updateProfile(new FormData(e.currentTarget));
      if (!result.ok) throw new Error(result.error);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/profile/image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "アップロードに失敗しました");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-10">
      {/* プロフィール写真 */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium">プロフィール写真</h2>
        <div className="flex items-center gap-5">
          {profile.profileImage ? (
            // 変種は作らないため <img> で表示
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.profileImage}
              alt="現在のプロフィール写真"
              className="size-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
              未設定
            </div>
          )}
          <div className="space-y-1.5">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mr-1 size-4" />
              {uploading ? "アップロード中..." : "画像を選択"}
            </Button>
            <p className="text-xs text-muted-foreground">
              正方形（512px）にトリミングして円形表示します。
            </p>
          </div>
        </div>
      </section>

      {/* テキスト */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>氏名・名義</Label>
            <Input name="name" defaultValue={profile.name} />
          </div>
          <div className="space-y-1.5">
            <Label>肩書き</Label>
            <Input name="tagline" defaultValue={profile.tagline} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>自己紹介</Label>
          <Textarea name="bio" rows={5} defaultValue={profile.bio} />
        </div>

        <div className="space-y-1.5">
          <Label>カメラ（1行に1項目・「名称 | 補足」）</Label>
          <Textarea
            name="gearBody"
            rows={2}
            placeholder={"Sony α7R VI (ILCE-7RM6) | 61MP フルサイズ"}
            defaultValue={profile.gearBody.join("\n")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>レンズ（1行に1項目・「名称 | 補足」）</Label>
          <Textarea
            name="gearLenses"
            rows={6}
            placeholder={"FE 24-70mm F2.8 GM II | 標準ズーム"}
            defaultValue={profile.gearLenses.join("\n")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>ソフトウェア（1行に1項目・「名称 | 補足」）</Label>
          <Textarea
            name="gearSoftware"
            rows={3}
            placeholder={"Adobe Lightroom Classic | RAW 現像"}
            defaultValue={profile.gearSoftware.join("\n")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>ポリシーのバッジ（空欄ならバッジ非表示）</Label>
          <Input
            name="policyBadge"
            placeholder="No Generative AI"
            defaultValue={profile.policyBadge}
          />
        </div>

        <div className="space-y-1.5">
          <Label>撮影ポリシー本文（空欄で /about のポリシー欄を非表示）</Label>
          <Textarea name="policy" rows={6} defaultValue={profile.policy} />
        </div>

        <Button type="submit" disabled={busy}>
          {busy ? "保存中..." : "保存"}
        </Button>
      </form>
    </div>
  );
}
