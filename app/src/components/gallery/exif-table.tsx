import {
  Camera,
  Aperture,
  Timer,
  Gauge,
  Ruler,
  Sun,
  Focus,
  ImageIcon,
  MapPin,
} from "lucide-react";
import type { Photo } from "@/generated/prisma/client";

interface ExifRow {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}

export function ExifTable({ photo }: { photo: Photo }) {
  const rows: ExifRow[] = [
    {
      icon: <Camera className="size-4" />,
      label: "Camera",
      value: photo.cameraModel,
    },
    {
      icon: <Focus className="size-4" />,
      label: "Lens",
      value: photo.lensModel,
    },
    {
      icon: <Ruler className="size-4" />,
      label: "Focal Length",
      value: photo.focalLength ? `${photo.focalLength}mm` : null,
    },
    {
      icon: <Aperture className="size-4" />,
      label: "Aperture",
      value: photo.aperture ? `f/${photo.aperture}` : null,
    },
    {
      icon: <Timer className="size-4" />,
      label: "Shutter Speed",
      value: photo.shutterSpeed ? `${photo.shutterSpeed}s` : null,
    },
    {
      icon: <Gauge className="size-4" />,
      label: "ISO",
      value: photo.iso?.toString() ?? null,
    },
    {
      icon: <Sun className="size-4" />,
      label: "White Balance",
      value: photo.whiteBalance,
    },
    {
      icon: <Focus className="size-4" />,
      label: "Metering",
      value: photo.meteringMode,
    },
    {
      icon: <ImageIcon className="size-4" />,
      label: "Resolution",
      value:
        photo.imageWidth && photo.imageHeight
          ? `${photo.imageWidth} × ${photo.imageHeight}`
          : null,
    },
    {
      icon: <MapPin className="size-4" />,
      label: "Location",
      value: photo.location,
    },
  ];

  return (
    <div className="space-y-3">
      {rows
        .filter((r) => r.value)
        .map((row) => (
          <div key={row.label} className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{row.icon}</span>
            <span className="w-28 shrink-0 text-muted-foreground">
              {row.label}
            </span>
            <span className="font-medium">{row.value}</span>
          </div>
        ))}
    </div>
  );
}
