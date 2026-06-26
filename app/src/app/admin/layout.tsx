import type { Metadata } from "next";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  Calendar,
  FileSignature,
  FileText,
  LayoutDashboard,
  Layers,
  MessageSquare,
  Tag,
  User,
} from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const adminNav = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Photos", href: "/admin/photos", icon: ImageIcon },
  { title: "Collections", href: "/admin/collections", icon: Layers },
  { title: "Services", href: "/admin/services", icon: Tag },
  { title: "Bookings", href: "/admin/bookings", icon: Calendar },
  { title: "Messages", href: "/admin/messages", icon: MessageSquare },
  { title: "Blog", href: "/admin/blog", icon: FileText },
  { title: "Contracts", href: "/admin/contracts", icon: FileSignature },
  { title: "Profile", href: "/admin/profile", icon: User },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <nav className="flex flex-wrap gap-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {session.user?.email}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button variant="outline" size="sm" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
