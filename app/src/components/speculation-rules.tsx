"use client";

import { useEffect } from "react";

/**
 * Speculation Rules — リンクをホバー/タッチした瞬間に遷移先を事前レンダリング。
 * React ツリー内の <script> はクライアント遷移時に実行されないため、
 * useEffect で document.head に注入する。非対応ブラウザでは何もしない。
 */
const RULES = JSON.stringify({
  prerender: [
    { where: { href_matches: "/gallery/*" }, eagerness: "moderate" },
  ],
  prefetch: [
    {
      where: {
        and: [
          { href_matches: "/*" },
          { not: { href_matches: "/admin/*" } },
          { not: { href_matches: "/api/*" } },
        ],
      },
      eagerness: "moderate",
    },
  ],
});

export function SpeculationRules() {
  useEffect(() => {
    if (
      typeof HTMLScriptElement === "undefined" ||
      !HTMLScriptElement.supports?.("speculationrules")
    ) {
      return;
    }
    const script = document.createElement("script");
    script.type = "speculationrules";
    script.textContent = RULES;
    document.head.append(script);
    return () => script.remove();
  }, []);

  return null;
}
