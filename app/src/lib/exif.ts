import exifr from "exifr";

export interface ExtractedExif {
  cameraModel: string | null;
  lensMake: string | null;
  lensModel: string | null;
  focalLength: number | null;
  aperture: number | null;
  shutterSpeed: string | null;
  iso: number | null;
  dateTaken: Date | null;
  whiteBalance: string | null;
  meteringMode: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  latitude: number | null;
  longitude: number | null;
}

function formatShutterSpeed(exposureTime: number | undefined): string | null {
  if (!exposureTime) return null;
  if (exposureTime >= 1) return `${exposureTime}`;
  return `1/${Math.round(1 / exposureTime)}`;
}

const METERING_MODES: Record<number, string> = {
  0: "Unknown",
  1: "Average",
  2: "Center-weighted",
  3: "Spot",
  4: "Multi-spot",
  5: "Multi-segment",
  6: "Partial",
};

export async function extractExif(buffer: Buffer): Promise<ExtractedExif> {
  try {
    const data = await exifr.parse(buffer, {
      tiff: true,
      exif: true,
      gps: true,
      interop: false,
      iptc: false,
      xmp: false,
      icc: false,
      makerNote: false,
      userComment: false,
      sanitize: true,
      mergeOutput: true,
      translateKeys: true,
      translateValues: false,
      reviveValues: true,
    });

    if (!data) {
      return emptyExif();
    }

    return {
      cameraModel: data.Model ?? null,
      lensMake: data.LensMake ?? null,
      lensModel: data.LensModel ?? null,
      focalLength: data.FocalLength ? Math.round(data.FocalLength) : null,
      aperture: data.FNumber ?? data.ApertureValue ?? null,
      shutterSpeed: formatShutterSpeed(data.ExposureTime),
      iso: data.ISO ?? null,
      dateTaken: data.DateTimeOriginal
        ? new Date(data.DateTimeOriginal)
        : null,
      whiteBalance:
        data.WhiteBalance === 0
          ? "Auto"
          : data.WhiteBalance === 1
            ? "Manual"
            : null,
      meteringMode:
        typeof data.MeteringMode === "number"
          ? METERING_MODES[data.MeteringMode] ?? null
          : null,
      imageWidth: data.ImageWidth ?? data.ExifImageWidth ?? null,
      imageHeight: data.ImageHeight ?? data.ExifImageHeight ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    };
  } catch {
    return emptyExif();
  }
}

const RAW_EXTENSIONS = new Set([
  "arw", "cr2", "cr3", "nef", "dng", "orf", "raf", "rw2", "pef", "srw",
]);

export function isRawFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return RAW_EXTENSIONS.has(ext);
}

export async function extractPreviewJpeg(
  buffer: Buffer
): Promise<Buffer | null> {
  try {
    const largest = extractLargestJpeg(buffer);
    if (largest && largest.length > 50_000) return largest;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thumb = await (exifr as any).thumbnail(buffer);
    if (thumb && thumb.length > 0) return Buffer.from(thumb);

    return null;
  } catch {
    return null;
  }
}

function extractLargestJpeg(buffer: Buffer): Buffer | null {
  let largest: Buffer | null = null;

  let i = 0;
  while (i < buffer.length - 1) {
    if (buffer[i] === 0xff && buffer[i + 1] === 0xd8) {
      const start = i;
      let j = i + 2;
      while (j < buffer.length - 1) {
        if (buffer[j] === 0xff && buffer[j + 1] === 0xd9) {
          const end = j + 2;
          const jpeg = buffer.subarray(start, end);
          if (!largest || jpeg.length > largest.length) {
            largest = Buffer.from(jpeg);
          }
          i = end;
          break;
        }
        j++;
      }
      if (j >= buffer.length - 1) break;
    } else {
      i++;
    }
  }

  return largest;
}

function emptyExif(): ExtractedExif {
  return {
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
}
