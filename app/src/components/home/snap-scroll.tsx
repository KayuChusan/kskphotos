"use client";

import { useEffect } from "react";

/**
 * トップページのみ、html に snap-page クラスを付けてセクションのやさしいスナップを有効化する。
 * CSS 側（globals.css）で `html.snap-page` を proximity スナップにし、
 * prefers-reduced-motion 時は無効化する。離脱時にクラスを外して他ページへ影響させない。
 */
export function SnapScroll() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("snap-page");
    return () => root.classList.remove("snap-page");
  }, []);
  return null;
}
