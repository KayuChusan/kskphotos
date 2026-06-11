import Link from "next/link";
import { mainNav, secondaryNav } from "./nav-config";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div>
            <p className="font-heading text-3xl font-medium tracking-wide">
              kskphotos
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Capturing moments, telling stories.
              <br />
              Photography portfolio &amp; booking.
            </p>
            <p className="exif-text mt-5 text-muted-foreground/50">
              <span className="text-safelight">●</span> Sony α7R IV · RAW ·
              Lightroom
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-7 gap-y-3">
            {[...mainNav, ...secondaryNav].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="exif-text text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="exif-text text-muted-foreground">
            &copy; {new Date().getFullYear()} kskphotos. All rights reserved.
          </p>
          <Link
            href="/privacy"
            className="exif-text text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
