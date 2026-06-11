"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const GLYPHS = "0123456789ABCDEF·/-+";

/**
 * カメラ起動時の計器表示のように、文字化けから順に確定していく演出。
 * reduced-motion 時は即座に確定文字列を表示。
 */
export function DecodeText({
  text,
  delay = 0,
  duration = 0.9,
}: {
  text: string;
  delay?: number;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (reduced) return;
    let raf: number;
    let started = false;
    const timer = setTimeout(() => {
      started = true;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / (duration * 1000));
        const settled = Math.floor(t * text.length);
        let out = text.slice(0, settled);
        for (let i = settled; i < text.length; i++) {
          out +=
            text[i] === " "
              ? " "
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setDisplay(out);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      if (started) cancelAnimationFrame(raf);
    };
  }, [text, delay, duration, reduced]);

  // 演出開始前も高さ・幅が暴れないよう不可視の確定文字列を敷く
  return (
    <span className="relative inline-block">
      <span className="invisible">{text}</span>
      <span className="absolute inset-0">{reduced ? text : display}</span>
    </span>
  );
}
