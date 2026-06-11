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
          kskphotos
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "exif-text relative transition-colors hover:text-foreground",
                pathname === item.href
                  ? "text-foreground after:absolute after:-bottom-1.5 after:left-1/2 after:size-[3px] after:-translate-x-1/2 after:rounded-full after:bg-safelight"
                  : "text-muted-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
          <Link
            href="/booking"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-foreground/30 font-mono text-[10px] uppercase tracking-[0.15em] hover:bg-foreground hover:text-background"
            )}
          >
            Book a Shoot
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
              kskphotos
            </SheetTitle>
            <nav className="mt-10 flex flex-col gap-5">
              {[...mainNav, ...secondaryNav].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:text-foreground",
                    pathname === item.href
                      ? "text-safelight"
                      : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
