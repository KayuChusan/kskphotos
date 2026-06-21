import { describe, it, expect } from "vitest";
import type { Photo } from "@/generated/prisma/client";
import {
  redactPhotoMeta,
  redactShootingMeta,
  maskPhotoImage,
  maskForViewer,
} from "./photo-visibility";

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
    isHero: false,
    isLocked: true,
    sortOrder: 0,
    collectionId: "c1",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
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

describe("redactShootingMeta", () => {
  it("撮影設定は伏せるが位置情報・画像は残す", () => {
    const r = redactShootingMeta(makePhoto());
    expect(r.cameraModel).toBeNull();
    expect(r.aperture).toBeNull();
    expect(r.iso).toBeNull();
    expect(r.dateTaken).toBeNull();
    expect(r.developNotes).toBeNull();
    expect(r.originalUrl).toBeNull();
    // 地図用の位置情報と画像は残す
    expect(r.latitude).toBe(35.6);
    expect(r.location).toBe("Tokyo");
    expect(r.imageUrl).toBe("/uploads/real.jpg");
  });
});

describe("maskForViewer", () => {
  const lockedPhoto = () => ({
    ...makePhoto(),
    collectionId: "c1",
    collection: { isLocked: true },
  });
  const publicPhoto = () => ({
    ...makePhoto(),
    collectionId: "c2",
    collection: { isLocked: false },
  });

  it("非会員×会員限定コレクション → 画像も EXIF もマスク", () => {
    const r = maskForViewer(lockedPhoto(), false);
    expect(r.masked).toBe(true);
    expect(r.imageUrl).toBe("");
    expect(r.cameraModel).toBeNull();
  });

  it("非会員×公開コレクション → 画像は残し撮影設定だけ伏せる", () => {
    const r = maskForViewer(publicPhoto(), false);
    expect(r.masked).toBe(false);
    expect(r.imageUrl).toBe("/uploads/real.jpg");
    expect(r.cameraModel).toBeNull();
    expect(r.location).toBe("Tokyo"); // 位置情報は残す
  });

  it("会員 → そのまま全部見える", () => {
    const r = maskForViewer(lockedPhoto(), true);
    expect(r.masked).toBe(false);
    expect(r.imageUrl).toBe("/uploads/real.jpg");
    expect(r.cameraModel).toBe("ILCE-7RM6");
  });
});
