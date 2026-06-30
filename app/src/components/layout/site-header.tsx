"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mainNav, secondaryNav } from "./nav-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  // ヘッダー直下のセクションが暗い面(data-header-dark)か。暗い面では白ロゴ・濃紺ヘッダーへ追従。
  const [overDark, setOverDark] = useState(isHome);
  // モバイルメニュー(Sheet)の開閉。リンクをタップしたら閉じる。
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const HEADER_H = 64;
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 24);
      // ヘッダーのすぐ下(y=HEADER_H)を跨ぐ「暗い面」があれば overDark
      let dark = false;
      document
        .querySelectorAll<HTMLElement>("[data-header-dark]")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top <= HEADER_H && r.bottom > HEADER_H) dark = true;
        });
      setOverDark(dark);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  // トップ(ヒーロー最上部)は透過ヘッダー。スクロール後はセクションの明暗に追従。
  const transparentTop = isHome && !scrolled;
  // 暗い面に重なるときの局所トークン（白文字・CTAは明色ボタン・濃紺ヘッダー）。透過トップ時は背景なし。
  const darkVars = {
    "--foreground": "oklch(0.95 0.01 262)",
    "--muted-foreground": "oklch(0.78 0.02 262)",
    "--primary": "oklch(0.95 0.01 262)",
    "--primary-foreground": "oklch(0.18 0.04 262)",
    "--border": "oklch(1 0 0 / 0.12)",
  } as React.CSSProperties;
  const headerStyle: React.CSSProperties | undefined = overDark
    ? transparentTop
      ? darkVars
      : { ...darkVars, backgroundColor: "oklch(0.16 0.045 262 / 0.82)" }
    : undefined;

  return (
    <header
      style={headerStyle}
      className={cn(
        "z-50 w-full transition-all duration-500",
        isHome ? "fixed top-0" : "sticky top-0",
        transparentTop
          ? "border-b border-transparent bg-transparent"
          : overDark
            ? "border-b border-white/10 backdrop-blur-md"
            : "border-b border-border/60 bg-background/75 backdrop-blur-md"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center" aria-label="KSK Works ホーム">
          <Image
            src={overDark ? "/ksk-works-logo-light.png" : "/ksk-works-logo-dark.png"}
            alt="KSK Works"
            width={960}
            height={168}
            className={cn(
              "h-7 w-auto",
              transparentTop && "drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
            )}
          />
        </Link>

        {/* Desktop nav — 日本語主 + 英字サブの二段 */}
        <nav className="hidden items-center gap-7 md:flex">
          {mainNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex flex-col items-center leading-none transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground/60">
                  {item.en}
                </span>
                <span className="mt-1 text-[13px] tracking-wide">
                  {item.title}
                </span>
                {active && (
                  <span className="absolute -bottom-2 left-1/2 size-[3px] -translate-x-1/2 rounded-full bg-safelight" />
                )}
              </Link>
            );
          })}
          <Link
            href="/booking"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "text-xs tracking-wide"
            )}
          >
            ご依頼・ご相談
          </Link>
        </nav>

        {/* Mobile nav */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "size-11 md:hidden"
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">メニュー</span>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle className="text-left">
              <Image
                src="/ksk-works-logo-dark.png"
                alt="KSK Works"
                width={960}
                height={168}
                className="h-7 w-auto"
              />
            </SheetTitle>
            <nav className="mt-10 flex flex-col gap-6">
              {[...mainNav, ...secondaryNav].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-baseline gap-3 py-2 transition-colors hover:text-foreground",
                    pathname === item.href
                      ? "text-safelight"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="text-lg tracking-wide">{item.title}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
                    {item.en}
                  </span>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
