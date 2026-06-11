"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";
import type { Photo } from "@/generated/prisma/client";

/** ダークテーマに合わせた CARTO Dark Matter ラスタータイル */
const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [{ id: "carto", type: "raster", source: "carto" }],
};

const DEFAULT_CENTER: [number, number] = [137.6, 36.2]; // 日本全体
const DEFAULT_ZOOM = 4.5;

export function PhotoMap({ photos }: { photos: Photo[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const withCoords = photos.filter(
    (p): p is Photo & { latitude: number; longitude: number } =>
      p.latitude != null && p.longitude != null
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

    const markers: maplibregl.Marker[] = [];

    for (const photo of withCoords) {
      // サムネイル入りのカスタムマーカー
      const el = document.createElement("a");
      el.href = `/gallery/${photo.id}`;
      el.className =
        "block size-14 cursor-pointer overflow-hidden rounded-full border-2 border-white/80 bg-black shadow-lg transition-transform hover:scale-110 hover:border-[var(--safelight)]";
      el.style.backgroundImage = `url(${photo.thumbnailUrl ?? photo.imageUrl})`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.setAttribute("aria-label", photo.title);

      const popup = new maplibregl.Popup({
        offset: 36,
        closeButton: false,
      }).setHTML(
        `<a href="/gallery/${photo.id}" class="photo-map-popup">` +
          `<strong>${photo.title}</strong>` +
          (photo.location ? `<span>${photo.location}</span>` : "") +
          `</a>`
      );

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([photo.longitude, photo.latitude])
        .setPopup(popup)
        .addTo(map);
      markers.push(marker);
    }

    if (withCoords.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      for (const p of withCoords) bounds.extend([p.longitude, p.latitude]);
      map.fitBounds(bounds, { padding: 80, maxZoom: 13, duration: 0 });
    }

    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
    // photos の id 列が変わった時のみ再構築
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withCoords.map((p) => p.id).join(",")]);

  return (
    <div className="relative overflow-hidden border">
      <div ref={containerRef} className="h-[600px] w-full" />
      <div className="exif-text pointer-events-none absolute left-4 top-4 z-10 bg-black/70 px-3 py-1.5 text-white/80 backdrop-blur-sm">
        <MapPin className="mr-1.5 inline size-3 text-safelight" />
        {withCoords.length} photos with GPS data
      </div>
      {withCoords.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <p className="bg-black/70 px-4 py-2 text-sm text-white/70 backdrop-blur-sm">
            GPS 情報付きの写真がまだありません
          </p>
        </div>
      )}
    </div>
  );
}
