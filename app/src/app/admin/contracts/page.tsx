import type { Metadata } from "next";
import { ContractGenerator } from "./contract-generator";

export const metadata: Metadata = {
  title: "契約書作成 - Admin | KSK Works",
};

export default function AdminContractsPage() {
  return (
    <div>
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-bold">業務委託契約書の作成</h1>
        <p className="text-sm text-muted-foreground">
          フォームに入力すると右側にプレビューが反映されます。「印刷 / PDF
          保存」から、ブラウザの印刷ダイアログで「PDF
          に保存」を選ぶとダウンロードできます。
        </p>
      </div>
      <ContractGenerator />
    </div>
  );
}
