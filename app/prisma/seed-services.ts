import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedServices } from "./services-data";

/**
 * 本番デプロイ時に料金メニュー(Service)だけを投入する。
 * createOnly（既存は上書きしない）なので、admin での編集・無効化を尊重する。
 * デモ用の写真/コレクション/ブログは投入しない（full seed.ts はローカル専用）。
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await seedServices(prisma);
  const count = await prisma.service.count();
  console.log(`Service seed 完了: 合計 ${count} 件`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
