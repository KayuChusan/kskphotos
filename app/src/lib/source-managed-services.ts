// 料金・納品ポリシーをコード側で一元管理する撮影/制作/保守の Service ID。
// これらは admin の手編集ではなくソース(prisma/services-data.ts)が正で、
// 毎デプロイで services-data.ts の内容に上書き同期される。
// → seed(prisma/services-data.ts) と admin の手編集ロックの両方が参照する単一の真実。
export const SOURCE_MANAGED_IDS: string[] = [
  "seed-svc-photo",
  "seed-svc-web",
  "seed-svc-maint",
];
