/**
 * 既存アップロード画像の WebP バリアント・blur プレースホルダーを再生成する。
 * カスタム画像ローダー導入前にアップロードされた写真を新パイプラインに追従させる。
 *
 * 実行: set -a; source .env; set +a; npx tsx scripts/regenerate-images.ts
 */
import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { processImage } from "../src/lib/images";
import { saveFile } from "../src/lib/storage";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function generateVariants(imageUrl: string) {
  const filePath = path.join(process.cwd(), "public", imageUrl);
  const buffer = await readFile(filePath);
  const processed = await processImage(buffer);
  const base = path.basename(imageUrl).replace(/\.(jpg|jpeg|png|webp)$/i, "");
  for (const v of processed.variants) {
    await saveFile(v.buffer, `${base}-w${v.width}.webp`);
  }
  return { processed, base };
}

async function main() {
  const photos = await prisma.photo.findMany();
  console.log(`${photos.length} photos to process`);

  for (const photo of photos) {
    try {
      const { processed, base } = await generateVariants(photo.imageUrl);
      await prisma.photo.update({
        where: { id: photo.id },
        data: {
          thumbnailUrl: `/uploads/${base}-w800.webp`,
          blurDataUrl: processed.blurDataUrl,
          imageWidth: processed.width,
          imageHeight: processed.height,
        },
      });
      console.log(`✓ ${photo.title} (${photo.imageUrl})`);

      if (photo.beforeUrl) {
        await generateVariants(photo.beforeUrl);
        console.log(`  ✓ before image (${photo.beforeUrl})`);
      }
    } catch (err) {
      console.error(`✗ ${photo.title}: ${(err as Error).message}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
