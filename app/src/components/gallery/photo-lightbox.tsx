"use client";

import { useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { Photo } from "@/generated/prisma/client";

/**
 * ネイティブ <dialog> による全画面ライトボックス。
 * フォーカストラップ・ESC で閉じる・トップレイヤー表示はブラウザが担保し、
 * 開閉アニメーションは CSS の @starting-style で行う（JS ライブラリ不使用）。
 */
export function PhotoLightbox({ photo }: { photo: Photo }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const exif = [
    photo.focalLength ? `${photo.focalLength}mm` : null,
    photo.aperture ? `f/${photo.aperture}` : null,
    photo.shutterSpeed ? `${photo.shutterSpeed}s` : null,
    photo.iso ? `ISO ${photo.iso}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="viewfinder relative mx-auto block w-fit cursor-zoom-in overflow-hidden"
        aria-label={`${photo.title} を全画面で表示`}
      >
        <Image
          src={photo.imageUrl}
          alt={photo.title}
          width={photo.imageWidth ?? 1200}
          height={photo.imageHeight ?? 800}
          placeholder={photo.blurDataUrl ? "blur" : "empty"}
          blurDataURL={photo.blurDataUrl ?? undefined}
          className="max-h-[75vh] w-auto object-contain"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
          style={{ viewTransitionName: `photo-${photo.id}` }}
        />
      </button>

      <dialog
        ref={dialogRef}
        className="lightbox m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white"
        onClick={(e) => {
          // 画像の外側（dialog 自身）のクリックで閉じる
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        aria-label={photo.title}
      >
        <div className="lightbox-iris pointer-events-none relative h-full w-full">
          <Image
            src={photo.imageUrl}
            alt={photo.title}
            fill
            className="object-contain"
            sizes="100vw"
          />
        </div>

        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="absolute right-5 top-5 z-30 p-2 text-white/60 transition-colors hover:text-white"
          aria-label="閉じる"
        >
          <X className="size-6" />
        </button>

        <div className="absolute bottom-5 left-5 z-30">
          <p className="font-heading text-lg">{photo.title}</p>
          {exif && (
            <p className="exif-text mt-1 text-white/50">
              <span className="text-safelight">●</span> {exif}
            </p>
          )}
        </div>
      </dialog>
    </>
  );
}
