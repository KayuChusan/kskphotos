import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kskworks.jp";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [photos, posts, collections] = await Promise.all([
    prisma.photo.findMany({
      where: { isPublished: true },
      select: { id: true, updatedAt: true, beforeUrl: true },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.collection.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const now = new Date();
  const staticPaths = [
    "",
    "/gallery",
    "/works",
    "/collections",
    "/dashboard",
    "/services",
    "/guide",
    "/booking",
    "/about",
    ...(posts.length > 0 ? ["/blog"] : []),
    "/contact",
    "/privacy",
  ];
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
  }));

  const photoRoutes: MetadataRoute.Sitemap = photos.flatMap((p) => {
    const entries: MetadataRoute.Sitemap = [
      { url: `${siteUrl}/gallery/${p.id}`, lastModified: p.updatedAt },
    ];
    if (p.beforeUrl) {
      entries.push({
        url: `${siteUrl}/gallery/${p.id}/compare`,
        lastModified: p.updatedAt,
      });
    }
    return entries;
  });

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${siteUrl}/collections/${c.slug}`,
    lastModified: c.updatedAt,
  }));

  return [...staticRoutes, ...photoRoutes, ...postRoutes, ...collectionRoutes];
}
