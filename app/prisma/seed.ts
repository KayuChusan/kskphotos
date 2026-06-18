import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedServices } from "./services-data";

/**
 * 開発・デモ用シードデータ。
 *
 * 実行: app/ で `npx prisma db seed`（prisma.config.ts に登録済み）または
 *       `npx tsx prisma/seed.ts`。DATABASE_URL を必ずローカル DB に向けること。
 *
 * 安全性: すべて upsert（unique キーで冪等）。deleteMany は行わないため、
 *         共有 Cloud SQL に誤接続しても既存データを破壊しない。
 *         画像は picsum.photos の外部URL（image-loader が /uploads 以外は素通し）で、
 *         ローカル/デモでそのまま表示できる。
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const img = (seed: string) =>
  `https://picsum.photos/seed/${seed}/1600/1067`;
const thumb = (seed: string) => `https://picsum.photos/seed/${seed}/800/533`;
const before = (seed: string) =>
  `https://picsum.photos/seed/${seed}/1600/1067?grayscale`;

const collections = [
  { slug: "sakura-2026", title: "桜、2026", description: "春の光と桜のシリーズ。", sortOrder: 1 },
  { slug: "tokyo-street", title: "Tokyo Street", description: "街のリズムを切り取るスナップ集。", sortOrder: 2 },
  { slug: "family-days", title: "Family Days", description: "家族の何気ない一日を残す。", sortOrder: 3 },
];

type SeedPhoto = {
  slug: string;
  title: string;
  category:
    | "PORTRAIT"
    | "LANDSCAPE"
    | "EVENT"
    | "STREET"
    | "ARCHITECTURE"
    | "FOOD";
  collectionSlug?: string;
  lensModel: string;
  focalLength: number;
  aperture: number;
  shutterSpeed: string;
  iso: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  isPortfolio?: boolean;
  hasBefore?: boolean;
  tags?: string[];
  sortOrder: number;
};

const photos: SeedPhoto[] = [
  { slug: "sakura-light", title: "桜並木の朝", category: "LANDSCAPE", collectionSlug: "sakura-2026", lensModel: "FE 24-70mm F2.8 GM", focalLength: 35, aperture: 2.8, shutterSpeed: "1/640", iso: 100, location: "目黒川, 東京", latitude: 35.6415, longitude: 139.6989, isPortfolio: true, hasBefore: true, tags: ["桜", "春"], sortOrder: 1 },
  { slug: "harbor-blue", title: "みなとみらいの夕景", category: "ARCHITECTURE", collectionSlug: "tokyo-street", lensModel: "FE 16-35mm F2.8 GM", focalLength: 16, aperture: 8, shutterSpeed: "1/125", iso: 200, location: "横浜, 神奈川", latitude: 35.4558, longitude: 139.638, isPortfolio: true, tags: ["夜景", "建築"], sortOrder: 2 },
  { slug: "street-rhythm", title: "交差点", category: "STREET", collectionSlug: "tokyo-street", lensModel: "FE 35mm F1.8", focalLength: 35, aperture: 2.2, shutterSpeed: "1/500", iso: 160, location: "渋谷, 東京", latitude: 35.6595, longitude: 139.7005, isPortfolio: true, tags: ["スナップ"], sortOrder: 3 },
  { slug: "portrait-window", title: "窓辺のポートレート", category: "PORTRAIT", collectionSlug: "family-days", lensModel: "FE 85mm F1.4 GM", focalLength: 85, aperture: 1.4, shutterSpeed: "1/800", iso: 100, location: "鎌倉, 神奈川", latitude: 35.3192, longitude: 139.5466, isPortfolio: true, hasBefore: true, tags: ["ポートレート", "自然光"], sortOrder: 4 },
  { slug: "family-walk", title: "海辺の散歩", category: "EVENT", collectionSlug: "family-days", lensModel: "FE 70-200mm F4 G OSS", focalLength: 135, aperture: 4, shutterSpeed: "1/1000", iso: 200, location: "江ノ島, 神奈川", latitude: 35.2996, longitude: 139.4807, tags: ["家族", "ロケーション"], sortOrder: 5 },
  { slug: "temple-quiet", title: "静寂の境内", category: "ARCHITECTURE", lensModel: "FE 24-70mm F2.8 GM", focalLength: 50, aperture: 5.6, shutterSpeed: "1/250", iso: 320, location: "鎌倉, 神奈川", latitude: 35.3266, longitude: 139.5466, tags: ["建築", "和"], sortOrder: 6 },
  { slug: "cafe-morning", title: "朝のカフェ", category: "FOOD", lensModel: "FE 35mm F1.8", focalLength: 35, aperture: 1.8, shutterSpeed: "1/200", iso: 400, location: "代官山, 東京", latitude: 35.6488, longitude: 139.703, tags: ["フード"], sortOrder: 7 },
  { slug: "event-stage", title: "ステージの一瞬", category: "EVENT", lensModel: "FE 70-200mm F4 G OSS", focalLength: 200, aperture: 4, shutterSpeed: "1/1250", iso: 1600, location: "横浜, 神奈川", latitude: 35.4657, longitude: 139.6223, tags: ["イベント"], sortOrder: 8 },
  { slug: "mountain-mist", title: "霧の稜線", category: "LANDSCAPE", collectionSlug: "sakura-2026", lensModel: "FE 70-200mm F4 G OSS", focalLength: 100, aperture: 8, shutterSpeed: "1/320", iso: 100, location: "箱根, 神奈川", latitude: 35.2324, longitude: 139.1069, tags: ["風景"], sortOrder: 9 },
];

async function main() {
  // 管理者ユーザー（メールで冪等）
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@kskphotos.local";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "KSK (Admin)", role: "ADMIN" },
    create: { email: adminEmail, name: "KSK (Admin)", role: "ADMIN" },
  });

  // コレクション（slug で冪等）
  for (const c of collections) {
    await prisma.collection.upsert({
      where: { slug: c.slug },
      update: { title: c.title, description: c.description, sortOrder: c.sortOrder, isPublished: true },
      create: { ...c, isPublished: true },
    });
  }

  // 写真（slug で冪等）
  for (const p of photos) {
    const data = {
      title: p.title,
      category: p.category,
      imageUrl: img(p.slug),
      thumbnailUrl: thumb(p.slug),
      beforeUrl: p.hasBefore ? before(p.slug) : null,
      location: p.location ?? null,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      cameraModel: "ILCE-7RM4",
      lensMake: "Sony",
      lensModel: p.lensModel,
      focalLength: p.focalLength,
      aperture: p.aperture,
      shutterSpeed: p.shutterSpeed,
      iso: p.iso,
      dateTaken: new Date(`2026-0${(p.sortOrder % 9) + 1}-1${p.sortOrder % 9}T09:30:00Z`),
      imageWidth: 1600,
      imageHeight: 1067,
      tags: p.tags ?? [],
      isPortfolio: p.isPortfolio ?? false,
      isPublished: true,
      sortOrder: p.sortOrder,
      collection: p.collectionSlug
        ? { connect: { slug: p.collectionSlug } }
        : undefined,
    };
    await prisma.photo.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
  }

  // 撮影サービス（services-data.ts の共有データ。ローカルは overwrite で初期内容に揃える）
  await seedServices(prisma, { overwrite: true });

  // ブログ（slug で冪等）
  const posts = [
    { slug: "why-maplibre", title: "地図ギャラリーに MapLibre を選んだ理由", excerpt: "撮影場所ベースで写真をたどる地図機能の裏側。", content: "EXIF の GPS から撮影地を地図に展開しています。MapLibre GL JS を採用し、無料タイルで運用コストを抑えています。", categories: ["技術"], isPublished: true, publishedAt: new Date("2026-05-10T00:00:00Z") },
    { slug: "before-after-develop", title: "RAW現像のビフォーアフター", excerpt: "現像で写真がどう変わるかをスライダーで。", content: "RAW から仕上げまでの現像レシピを、ビフォーアフターのスライダー比較で紹介します。", categories: ["撮影", "現像"], isPublished: true, publishedAt: new Date("2026-05-24T00:00:00Z") },
  ];
  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  const [pc, cc, sc, bc] = await Promise.all([
    prisma.photo.count(),
    prisma.collection.count(),
    prisma.service.count(),
    prisma.blogPost.count(),
  ]);
  console.log(
    `Seed 完了: photos=${pc}, collections=${cc}, services=${sc}, posts=${bc}`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
