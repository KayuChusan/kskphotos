"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // トップはヒーローに重ねる透過ヘッダー、スクロールでブラー背景へ
  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        "z-50 w-full transition-all duration-500",
        isHome ? "fixed top-0" : "sticky top-0",
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border/60 bg-background/75 backdrop-blur-md"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="font-heading text-2xl font-medium tracking-wide"
        >
          KSK Works
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
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-foreground/30 text-xs tracking-wide hover:bg-foreground hover:text-background"
            )}
          >
            ご依頼・ご相談
          </Link>
        </nav>

        {/* Mobile nav */}
        <Sheet>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "md:hidden"
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">メニュー</span>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle className="text-left font-heading text-2xl font-medium">
              KSK Works
            </SheetTitle>
            <nav className="mt-10 flex flex-col gap-6">
              {[...mainNav, ...secondaryNav].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-baseline gap-3 transition-colors hover:text-foreground",
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
