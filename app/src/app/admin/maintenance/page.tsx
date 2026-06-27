import type { Metadata } from "next";
import { MaintenanceGenerator } from "./maintenance-generator";

export const metadata: Metadata = {
  title: "保守運用契約書の作成 - Admin | KSK Works",
};

export default function AdminMaintenancePage() {
  return (
    <div>
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-bold">保守運用契約書の作成</h1>
        <p className="text-sm text-muted-foreground">
          公開後の保守・運用（更新代行・ホスティング維持）の契約書です。フォームに入力すると右側にプレビューが反映されます。「印刷
          / PDF 保存」から、ブラウザの印刷ダイアログで「PDF
          に保存」を選ぶとダウンロードできます。
        </p>
      </div>
      <MaintenanceGenerator />
    </div>
  );
}
