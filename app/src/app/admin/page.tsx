import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ImageIcon, Calendar, FileText, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const [photoCount, bookingCount, blogCount, messageCount] = await Promise.all(
    [
      prisma.photo.count(),
      prisma.booking.count(),
      prisma.blogPost.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ]
  );

  const stats = [
    {
      title: "Photos",
      count: photoCount,
      icon: ImageIcon,
      href: "/admin/photos",
    },
    {
      title: "Bookings",
      count: bookingCount,
      icon: Calendar,
      href: "/admin/bookings",
    },
    {
      title: "Blog Posts",
      count: blogCount,
      icon: FileText,
      href: "/admin/blog",
    },
    {
      title: "Unread Messages",
      count: messageCount,
      icon: MessageSquare,
      href: "/admin",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="size-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.count}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
