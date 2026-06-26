import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedServices } from "./services-data";
import { seedCaseStudies } from "./case-studies-data";

/**
 * 本番デプロイ時に料金メニュー(Service)と実績(CaseStudy)を投入する。
 * createOnly（既存は上書きしない）なので、admin での編集・無効化を尊重する。
 * デモ用の写真/コレクション/ブログは投入しない（full seed.ts はローカル専用）。
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await seedServices(prisma);
  await seedCaseStudies(prisma);
  const [services, cases] = await Promise.all([
    prisma.service.count(),
    prisma.caseStudy.count(),
  ]);
  console.log(`Seed 完了: Service ${services} 件 / CaseStudy ${cases} 件`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
