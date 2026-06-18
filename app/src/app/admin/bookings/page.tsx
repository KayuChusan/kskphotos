import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { setBookingStatus, setBookingNote } from "./actions";

export const metadata: Metadata = {
  title: "Bookings - Admin | KSK Works",
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "受付中" },
  { value: "CONFIRMED", label: "確定" },
  { value: "COMPLETED", label: "完了" },
  { value: "CANCELLED", label: "キャンセル" },
];
const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label])
);

function fmtDateTime(d: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
function fmtDate(d: Date | null) {
  if (!d) return "未指定";
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(d);
}

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">依頼管理（{bookings.length}）</h1>

      {bookings.length === 0 ? (
        <p className="text-muted-foreground">撮影依頼はまだありません。</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => (
            <li key={b.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {STATUS_LABELS[b.status] ?? b.status}
                  </Badge>
                  <span className="font-medium">{b.name}</span>
                  <a
                    href={`mailto:${b.email}`}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    {b.email}
                  </a>
                  {b.phone && (
                    <span className="text-sm text-muted-foreground">
                      {b.phone}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {fmtDateTime(b.createdAt)}
                </span>
              </div>

              <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">希望日</dt>
                  <dd>{fmtDate(b.preferredDate)}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">場所</dt>
                  <dd>{b.location ?? "未指定"}</dd>
                </div>
              </dl>

              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {b.message}
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <form
                  action={setBookingStatus.bind(null, b.id)}
                  className="flex items-end gap-2"
                >
                  <label className="space-y-1 text-xs text-muted-foreground">
                    ステータス
                    <select
                      name="status"
                      defaultValue={b.status}
                      className="block rounded-md border border-input bg-transparent px-2 py-1.5 text-sm text-foreground"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button type="submit" variant="outline" size="sm">
                    更新
                  </Button>
                </form>

                <form
                  action={setBookingNote.bind(null, b.id)}
                  className="flex flex-1 items-end gap-2"
                >
                  <label className="flex-1 space-y-1 text-xs text-muted-foreground">
                    管理メモ
                    <Textarea
                      name="adminNote"
                      defaultValue={b.adminNote ?? ""}
                      rows={1}
                      className="min-h-9"
                      placeholder="対応状況のメモ"
                    />
                  </label>
                  <Button type="submit" variant="outline" size="sm">
                    メモ保存
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
