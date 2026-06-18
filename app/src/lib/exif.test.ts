import { beforeEach, describe, expect, it, vi } from "vitest";

const exifrMock = vi.hoisted(() => ({
  parse: vi.fn(),
  thumbnail: vi.fn(),
}));

vi.mock("exifr", () => ({
  default: exifrMock,
}));

import { extractExif, extractPreviewJpeg, isRawFile } from "./exif";

const emptyExif = {
  cameraModel: null,
  lensMake: null,
  lensModel: null,
  focalLength: null,
  aperture: null,
  shutterSpeed: null,
  iso: null,
  dateTaken: null,
  whiteBalance: null,
  meteringMode: null,
  imageWidth: null,
  imageHeight: null,
  latitude: null,
  longitude: null,
};

function jpegBuffer(length: number, fill = 0x11): Buffer {
  const buffer = Buffer.alloc(length, fill);
  buffer[0] = 0xff;
  buffer[1] = 0xd8;
  buffer[length - 2] = 0xff;
  buffer[length - 1] = 0xd9;
  return buffer;
}

describe("isRawFile", () => {
  it.each([
    "photo.arw",
    "photo.cr2",
    "photo.cr3",
    "photo.nef",
    "photo.dng",
    "photo.orf",
    "photo.raf",
    "photo.rw2",
    "photo.pef",
    "photo.srw",
  ])("returns true for RAW extension %s", (filename) => {
    expect(isRawFile(filename)).toBe(true);
  });

  it("is case-insensitive and handles filenames with paths", () => {
    expect(isRawFile("/photos/session/IMG_0001.ARW")).toBe(true);
    expect(isRawFile("C:/photos/session/IMG_0002.NeF")).toBe(true);
  });

  it.each(["photo", "/photos/session/photo", "photo.jpg", "photo.png", "photo.webp"])(
    "returns false for non-RAW filename %s",
    (filename) => {
      expect(isRawFile(filename)).toBe(false);
    }
  );
});

describe("extractExif shutter speed formatting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    [undefined, null],
    [0, null],
    [1, "1"],
    [2.5, "2.5"],
    [1 / 200, "1/200"],
    [1 / 199.6, "1/200"],
    [1 / 199.4, "1/199"],
  ])("formats ExposureTime %s as %s", async (exposureTime, expected) => {
    exifrMock.parse.mockResolvedValue({ ExposureTime: exposureTime });

    await expect(extractExif(Buffer.from("jpeg"))).resolves.toMatchObject({
      shutterSpeed: expected,
    });
  });
});

describe("extractPreviewJpeg", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    exifrMock.thumbnail.mockResolvedValue(null);
  });

  it("selects the largest embedded JPEG marker pair", async () => {
    const small = jpegBuffer(60_000, 0x22);
    const large = jpegBuffer(80_000, 0x33);
    const buffer = Buffer.concat([
      Buffer.from([0x00, 0x01, 0x02]),
      small,
      Buffer.from([0x03, 0x04]),
      large,
    ]);

    const result = await extractPreviewJpeg(buffer);

    expect(result).toEqual(large);
  });

  it("returns null when no valid JPEG marker pair exists", async () => {
    await expect(
      extractPreviewJpeg(Buffer.from([0x00, 0xff, 0xd8, 0x01, 0x02]))
    ).resolves.toBeNull();
  });

  it("ignores embedded JPEGs at or below the preview size threshold", async () => {
    const thumbnail = Buffer.from([0x01, 0x02, 0x03]);
    exifrMock.thumbnail.mockResolvedValue(thumbnail);

    const result = await extractPreviewJpeg(jpegBuffer(50_000, 0x44));

    expect(result).toEqual(thumbnail);
  });

  it("returns null and never throws for truncated or garbage buffers", async () => {
    await expect(extractPreviewJpeg(Buffer.from([0xff]))).resolves.toBeNull();
    await expect(
      extractPreviewJpeg(Buffer.from([0xff, 0xd8, 0x99, 0x88, 0x77]))
    ).resolves.toBeNull();
    await expect(extractPreviewJpeg(Buffer.from("not a jpeg"))).resolves.toBeNull();
  });
});

describe("extractExif field mapping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps EXIF fields and prefers FNumber over ApertureValue", async () => {
    const date = new Date("2026-06-18T10:11:12.000Z");
    exifrMock.parse.mockResolvedValue({
      Model: "Canon EOS R5",
      LensMake: "Canon",
      LensModel: "RF 50mm",
      FocalLength: 49.6,
      FNumber: 2.8,
      ApertureValue: 4,
      ExposureTime: 1 / 125,
      ISO: 400,
      DateTimeOriginal: date,
      WhiteBalance: 0,
      MeteringMode: 5,
      ImageWidth: 6000,
      ExifImageWidth: 5999,
      ImageHeight: 4000,
      ExifImageHeight: 3999,
      latitude: 35.681236,
      longitude: 139.767125,
    });

    await expect(extractExif(Buffer.from("jpeg"))).resolves.toEqual({
      cameraModel: "Canon EOS R5",
      lensMake: "Canon",
      lensModel: "RF 50mm",
      focalLength: 50,
      aperture: 2.8,
      shutterSpeed: "1/125",
      iso: 400,
      dateTaken: date,
      whiteBalance: "Auto",
      meteringMode: "Multi-segment",
      imageWidth: 6000,
      imageHeight: 4000,
      latitude: 35.681236,
      longitude: 139.767125,
    });
  });

  it("falls back from ApertureValue, ExifImageWidth, and ExifImageHeight", async () => {
    exifrMock.parse.mockResolvedValue({
      ApertureValue: 5.6,
      ExifImageWidth: 3000,
      ExifImageHeight: 2000,
    });

    await expect(extractExif(Buffer.from("jpeg"))).resolves.toMatchObject({
      aperture: 5.6,
      imageWidth: 3000,
      imageHeight: 2000,
    });
  });

  it.each([
    [0, "Auto"],
    [1, "Manual"],
    [2, null],
    ["Auto", null],
  ])("maps WhiteBalance %s to %s", async (whiteBalance, expected) => {
    exifrMock.parse.mockResolvedValue({ WhiteBalance: whiteBalance });

    await expect(extractExif(Buffer.from("jpeg"))).resolves.toMatchObject({
      whiteBalance: expected,
    });
  });

  it.each([
    [0, "Unknown"],
    [1, "Average"],
    [2, "Center-weighted"],
    [3, "Spot"],
    [4, "Multi-spot"],
    [5, "Multi-segment"],
    [6, "Partial"],
    [999, null],
    ["5", null],
  ])("maps MeteringMode %s to %s", async (meteringMode, expected) => {
    exifrMock.parse.mockResolvedValue({ MeteringMode: meteringMode });

    await expect(extractExif(Buffer.from("jpeg"))).resolves.toMatchObject({
      meteringMode: expected,
    });
  });

  it("returns empty EXIF data when exifr returns null", async () => {
    exifrMock.parse.mockResolvedValue(null);

    await expect(extractExif(Buffer.from("jpeg"))).resolves.toEqual(emptyExif);
  });

  it("returns empty EXIF data when exifr throws", async () => {
    exifrMock.parse.mockRejectedValue(new Error("parse failed"));

    await expect(extractExif(Buffer.from("jpeg"))).resolves.toEqual(emptyExif);
  });
});
