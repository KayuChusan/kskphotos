"use client";

import { MotionConfig } from "framer-motion";

/** OS の「視差効果を減らす」設定を framer-motion 全体に反映する */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
