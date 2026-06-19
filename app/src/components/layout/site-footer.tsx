import Link from "next/link";
import { mainNav, secondaryNav } from "./nav-config";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div>
            <p className="font-heading text-3xl font-medium tracking-wide">
              KSK Works
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              出張撮影・ポートレート。
              <br />
              撮る、つくる、ささえる。
            </p>
            <p className="exif-text mt-5 text-muted-foreground/50">
              <span className="text-safelight">●</span> Sony α7R IV · RAW ·
              Lightroom
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <nav className="flex flex-wrap gap-x-7 gap-y-3 md:justify-end">
              {[...mainNav, ...secondaryNav].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
              <Link
                href="/guide"
                className="exif-text text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                ご利用案内
              </Link>
              <Link
                href="/collections"
                className="exif-text text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                コレクション
              </Link>
              <Link
                href="/dashboard"
                className="exif-text text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                撮影データ
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="exif-text text-muted-foreground">
            &copy; {new Date().getFullYear()} KSK Works. All rights reserved.
          </p>
          <Link
            href="/privacy"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            プライバシーポリシー
          </Link>
        </div>
      </div>
    </footer>
  );
}
