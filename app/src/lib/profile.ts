import { prisma } from "./prisma";
import type { SiteProfile } from "@/generated/prisma/client";

export const PROFILE_ID = "singleton";

/** 機材1行の表示用パース。"名称 | 補足" → { name, note } */
export function parseGearItem(line: string): { name: string; note: string } {
  const [name, ...rest] = line.split("|");
  return { name: (name ?? "").trim(), note: rest.join("|").trim() };
}

/**
 * /about・/admin/profile の初期コンテンツ。DB に未保存のときはこれを表示し、
 * 管理画面で初回保存すると singleton レコードが作られる。
 */
export const DEFAULT_PROFILE = {
  id: PROFILE_ID,
  name: "ksk",
  tagline: "フォトグラファー",
  bio: "神奈川を拠点に活動するフォトグラファー。ポートレート、風景、ストリートスナップを中心に、出張撮影は全国対応。Sony α7R VI の高解像度を活かした描写と、撮影データを一枚ずつ丁寧に仕上げることにこだわっています。",
  profileImage: null as string | null,
  profileBlur: null as string | null,
  gearBody: ["Sony α7R VI (ILCE-7RM6) | 61MP フルサイズ"],
  gearLenses: [
    "FE 16-35mm F2.8 GM | 広角ズーム",
    "FE 24-70mm F2.8 GM II | 標準ズーム",
    "FE 70-200mm F2.8 GM II | 望遠ズーム",
    "FE 35mm F1.4 GM | 広角単焦点",
    "FE 50mm F1.2 GM | 標準単焦点",
    "FE 85mm F1.4 GM | 中望遠単焦点",
  ],
  gearSoftware: [
    "Adobe Lightroom Classic | 写真の調整・仕上げ",
    "Adobe Photoshop | レタッチ",
  ],
  policyBadge: "No Generative AI",
  policy:
    "当サイトに掲載するすべての写真は、実際のカメラ（Sony α7R VI）で撮影したものです。編集は Adobe Lightroom での明るさ・色の調整やトリミングのみで、生成AIによる画像の生成・合成・要素の追加や削除は一切行っていません。各写真の詳細ページでは撮影機材・撮影日などの来歴を、Before / After ページでは仕上げ前後の違いをそのまま公開しています。",
};

export type ProfileContent = Pick<
  SiteProfile,
  | "name"
  | "tagline"
  | "bio"
  | "profileImage"
  | "profileBlur"
  | "gearBody"
  | "gearLenses"
  | "gearSoftware"
  | "policyBadge"
  | "policy"
>;

/**
 * プロフィールを取得。未保存なら DEFAULT_PROFILE を返す（読み取り時に書き込みはしない）。
 * テーブル未作成など DB エラー時もページが落ちないよう既定値にフォールバック。
 */
export async function getProfile(): Promise<ProfileContent> {
  try {
    const p = await prisma.siteProfile.findUnique({ where: { id: PROFILE_ID } });
    return p ?? DEFAULT_PROFILE;
  } catch (err) {
    console.error("getProfile error:", err);
    return DEFAULT_PROFILE;
  }
}

/** プロフィールの作成/更新（singleton）。作成時は既定値で埋めてから上書きする。 */
export async function upsertProfile(
  data: Partial<ProfileContent>
): Promise<void> {
  const { id: _id, ...defaults } = DEFAULT_PROFILE;
  void _id;
  await prisma.siteProfile.upsert({
    where: { id: PROFILE_ID },
    create: { id: PROFILE_ID, ...defaults, ...data },
    update: data,
  });
}
