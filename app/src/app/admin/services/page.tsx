import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ServicesManager } from "./services-manager";

export const metadata: Metadata = {
  title: "Services - Admin | KSK Works",
};

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">料金・メニュー</h1>
        <p className="text-sm text-muted-foreground">
          ここで登録・編集した内容が公開ページ /services と依頼フォームのプラン選択に反映されます。
        </p>
      </div>
      <ServicesManager services={services} />
    </div>
  );
}
