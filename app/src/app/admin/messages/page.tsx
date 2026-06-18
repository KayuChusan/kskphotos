import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setMessageRead, deleteMessage } from "./actions";

export const metadata: Metadata = {
  title: "Messages - Admin | KSK Works",
};

function fmt(d: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        お問い合わせ（{messages.length}）
      </h1>

      {messages.length === 0 ? (
        <p className="text-muted-foreground">メッセージはまだありません。</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-lg border p-4 ${
                m.isRead ? "bg-card" : "border-safelight/40 bg-safelight/5"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {!m.isRead && (
                    <Badge className="bg-safelight text-[10px] text-black">
                      未読
                    </Badge>
                  )}
                  <span className="font-medium">{m.name}</span>
                  <a
                    href={`mailto:${m.email}`}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    {m.email}
                  </a>
                </div>
                <span className="text-xs text-muted-foreground">
                  {fmt(m.createdAt)}
                </span>
              </div>

              {m.subject && <p className="mt-2 font-medium">{m.subject}</p>}
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {m.message}
              </p>

              <div className="mt-3 flex gap-2">
                <form action={setMessageRead.bind(null, m.id, !m.isRead)}>
                  <Button type="submit" variant="outline" size="sm">
                    {m.isRead ? "未読にする" : "既読にする"}
                  </Button>
                </form>
                <form action={deleteMessage.bind(null, m.id)}>
                  <Button type="submit" variant="ghost" size="sm">
                    削除
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
