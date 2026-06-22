import type { Metadata } from "next";
import { getProfile } from "@/lib/profile";
import { ProfileManager } from "./profile-manager";

export const metadata: Metadata = {
  title: "プロフィール編集",
  robots: { index: false, follow: false },
};

// 最新の保存内容を表示するため動的レンダリング
export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const profile = await getProfile();

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium">プロフィール</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        ここで編集した内容が公開ページ <code>/about</code> に反映されます。
      </p>
      <div className="mt-8">
        <ProfileManager profile={profile} />
      </div>
    </div>
  );
}
