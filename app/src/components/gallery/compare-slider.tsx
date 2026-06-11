"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type PointerEvent,
} from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CompareSliderProps {
  beforeUrl: string;
  afterUrl: string;
  className?: string;
}

export function CompareSlider({
  beforeUrl,
  afterUrl,
  className,
}: CompareSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const sweepDone = useRef(false);
  const reduced = useReducedMotion();

  // 初回表示時にスライダーが一往復し、操作できることを示す。
  // ユーザーが触った瞬間に中断する。
  useEffect(() => {
    if (reduced || sweepDone.current) return;
    let raf: number;
    const DURATION = 2600;
    const start = performance.now();
    const tick = (now: number) => {
      if (sweepDone.current) return;
      const t = Math.min(1, (now - start) / DURATION);
      // 50 → 92 → 8 → 50 を1サイクルの正弦波で
      const eased = Math.sin(t * Math.PI * 2);
      setPosition(50 + eased * 42);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        sweepDone.current = true;
        setPosition(50);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percent);
  }, []);

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      sweepDone.current = true; // 自動スイープを中断
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-[3/2] cursor-ew-resize select-none overflow-hidden rounded-lg",
        className
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* After (full background) */}
      <Image
        src={afterUrl}
        alt="After (Edited)"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeUrl}
          alt="Before (RAW)"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 z-10 w-0.5 bg-white shadow-[0_0_4px_rgba(0,0,0,0.5)]"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/50 shadow-lg">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-white"
          >
            <path
              d="M6 10L2 10M2 10L5 7M2 10L5 13M14 10L18 10M18 10L15 7M18 10L15 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="pointer-events-none absolute top-4 left-4 z-20 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">
        RAW
      </div>
      <div className="pointer-events-none absolute top-4 right-4 z-20 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">
        Edited
      </div>
    </div>
  );
}
