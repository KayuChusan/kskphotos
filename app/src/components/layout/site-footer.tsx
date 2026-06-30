import Image from "next/image";
import Link from "next/link";
import { mainNav, secondaryNav } from "./nav-config";

export function SiteFooter() {
  return (
    <footer data-header-dark className="bluehour grain border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div>
            <Image
              src="/ksk-works-logo-light.png"
              alt="KSK Works"
              width={960}
              height={168}
              className="h-9 w-auto"
            />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              出張撮影・ポートレート。
              <br />
              撮る、つくる、ささえる。
            </p>
            <p className="exif-text mt-5 text-muted-foreground/50">
              <span className="text-safelight">●</span> RAW · Lightroom
            </p>

            {/* 運営者情報（最小限の信頼性表示。住所・電話は出さず連絡導線に集約） */}
            <dl className="mt-6 space-y-1 text-xs leading-relaxed text-muted-foreground/80">
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 text-muted-foreground/50">運営者</dt>
                <dd>KSK Works</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 text-muted-foreground/50">拠点</dt>
                <dd>神奈川（全国出張対応）</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 text-muted-foreground/50">連絡先</dt>
                <dd>
                  <a
                    href="mailto:info@kskworks.jp"
                    className="transition-colors hover:text-foreground"
                  >
                    info@kskworks.jp
                  </a>
                </dd>
              </div>
            </dl>
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
          <div className="flex items-center gap-5">
            <Link
              href="/contact"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              お問い合わせ
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              プライバシーポリシー
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
