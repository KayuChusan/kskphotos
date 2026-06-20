import { describe, it, expect } from "vitest";
import type { Photo } from "@/generated/prisma/client";
import { redactPhotoMeta, maskPhotoImage } from "./photo-visibility";

// テスト用の最小 Photo（型を満たすダミー値）
function makePhoto(overrides: Partial<Photo> = {}): Photo {
  return {
    id: "p1",
    slug: "p1",
    title: "Sample",
    description: "desc",
    imageUrl: "/uploads/real.jpg",
    thumbnailUrl: "/uploads/real-w800.webp",
    beforeUrl: "/uploads/real-before.jpg",
    originalUrl: "/uploads/real-original.jpg",
    blurDataUrl: "data:image/webp;base64,AAAA",
    imageWidth: 2000,
    imageHeight: 1333,
    category: "LANDSCAPE",
    tags: ["a"],
    cameraModel: "ILCE-7RM6",
    lensMake: "Sony",
    lensModel: "FE 24-70mm",
    focalLength: 50,
    aperture: 2.8,
    shutterSpeed: "1/200",
    iso: 100,
    dateTaken: new Date("2026-01-01"),
    whiteBalance: "Auto",
    meteringMode: "Multi",
    latitude: 35.6,
    longitude: 139.7,
    location: "Tokyo",
    developNotes: "secret recipe",
    isPublished: true,
    isPortfolio: false,
    isLocked: true,
    sortOrder: 0,
    collectionId: "c1",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  } as Photo;
}

describe("redactPhotoMeta", () => {
  it("EXIF・現像レシピ・位置情報を伏せる", () => {
    const r = redactPhotoMeta(makePhoto());
    expect(r.cameraModel).toBeNull();
    expect(r.lensModel).toBeNull();
    expect(r.aperture).toBeNull();
    expect(r.iso).toBeNull();
    expect(r.dateTaken).toBeNull();
    expect(r.latitude).toBeNull();
    expect(r.longitude).toBeNull();
    expect(r.location).toBeNull();
    expect(r.developNotes).toBeNull();
    expect(r.originalUrl).toBeNull();
  });

  it("画像 URL は残す（Phase 1 では画像表示する）", () => {
    const r = redactPhotoMeta(makePhoto());
    expect(r.imageUrl).toBe("/uploads/real.jpg");
    expect(r.thumbnailUrl).toBe("/uploads/real-w800.webp");
    expect(r.blurDataUrl).toBe("data:image/webp;base64,AAAA");
  });
});

describe("maskPhotoImage", () => {
  it("本画像・サムネ・ビフォー URL を取り除く", () => {
    const m = maskPhotoImage(makePhoto());
    expect(m.imageUrl).toBe("");
    expect(m.thumbnailUrl).toBeNull();
    expect(m.beforeUrl).toBeNull();
  });

  it("blurDataUrl と寸法は残す（プレースホルダ表示用）", () => {
    const m = maskPhotoImage(makePhoto());
    expect(m.blurDataUrl).toBe("data:image/webp;base64,AAAA");
    expect(m.imageWidth).toBe(2000);
    expect(m.imageHeight).toBe(1333);
  });

  it("EXIF も同時に伏せる", () => {
    const m = maskPhotoImage(makePhoto());
    expect(m.cameraModel).toBeNull();
    expect(m.developNotes).toBeNull();
    expect(m.originalUrl).toBeNull();
  });
});
