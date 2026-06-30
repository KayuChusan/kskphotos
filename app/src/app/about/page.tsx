import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import { Camera, Aperture, BadgeCheck, Monitor } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProfile, parseGearItem } from "@/lib/profile";
import { JsonLd } from "@/components/json-ld";
import { personSchema, breadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  ...pageSeo({ path: "/about" }),
  title: "プロフィール",
  description:
    "フォトグラファープロフィール — 使用機材、撮影スタイル、経歴について。",
};

// 管理画面（/admin/profile）の更新を反映するためオンデマンド再検証
export const revalidate = 3600;

function GearList({
  items,
  wrap = false,
}: {
  items: string[];
  wrap?: boolean;
}) {
  return (
    <ul className={wrap ? "flex flex-wrap gap-x-8 gap-y-2" : "space-y-2"}>
      {items.map((line, i) => {
        const { name, note } = parseGearItem(line);
        return (
          <li key={`${name}-${i}`} className="text-sm">
            <span className="font-medium">{name}</span>
            {note && <span className="ml-2 text-muted-foreground">{note}</span>}
          </li>
        );
      })}
    </ul>
  );
}

export default async function AboutPage() {
  const profile = await getProfile();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <JsonLd
        data={[
          personSchema({
            name: profile.name,
            image: profile.profileImage,
            knowsAbout: ["ポートレート撮影", "出張撮影", "Web制作"],
          }),
          breadcrumbSchema([
            { name: "ホーム", path: "/" },
            { name: "プロフィール", path: "/about" },
          ]),
        ]}
      />
      <div className="mb-10">
        <p className="eyebrow">Profile</p>
        <h1 className="mt-2 font-heading text-5xl font-medium">プロフィール</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          撮影者のプロフィールと使用機材について。
        </p>
      </div>

      {/* Profile */}
      <section className="mb-12">
        <div className="flex items-start gap-6">
          {profile.profileImage ? (
            // 変種は作らないため next/image ではなく <img> で表示
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.profileImage}
              alt={profile.name}
              width={96}
              height={96}
              className="size-24 shrink-0 rounded-full object-cover"
              style={
                profile.profileBlur
                  ? {
                      backgroundImage: `url(${profile.profileBlur})`,
                      backgroundSize: "cover",
                    }
                  : undefined
              }
            />
          ) : (
            <div className="size-24 shrink-0 rounded-full bg-muted" />
          )}
          <div>
            <h2 className="font-heading text-2xl font-medium">{profile.name}</h2>
            {profile.tagline && (
              <p className="exif-text mt-1 text-muted-foreground">
                {profile.tagline}
              </p>
            )}
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          </div>
        </div>
      </section>

      <Separator className="mb-12" />

      {/* Gear */}
      <section>
        <h2 className="mb-6 font-heading text-3xl font-medium">撮影機材</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {profile.gearBody.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="size-5" />
                  カメラ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GearList items={profile.gearBody} />
              </CardContent>
            </Card>
          )}

          {profile.gearLenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Aperture className="size-5" />
                  レンズ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GearList items={profile.gearLenses} />
              </CardContent>
            </Card>
          )}

          {profile.gearSoftware.length > 0 && (
            <Card className="sm:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="size-5" />
                  ソフトウェア
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GearList items={profile.gearSoftware} wrap />
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {profile.policy && (
        <>
          <Separator className="my-12" />

          {/* 真正性ポリシー */}
          <section>
            <h2 className="mb-6 font-heading text-3xl font-medium">
              撮影ポリシー
            </h2>
            <div className="border border-border/60 p-6">
              {profile.policyBadge && (
                <p className="eyebrow mb-4">
                  <BadgeCheck className="mr-1.5 inline size-3.5 text-safelight" />
                  {profile.policyBadge}
                </p>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {profile.policy}
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
