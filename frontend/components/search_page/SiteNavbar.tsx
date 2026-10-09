"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { ArrowLeft, BookOpen, SunMoon } from "lucide-react";

interface SiteNavbarProps {
  showBackToCatalog?: boolean;
}

export default function SiteNavbar({
  showBackToCatalog = false,
}: SiteNavbarProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Library Search Engine
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {showBackToCatalog && (
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-3 sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="sm:hidden">Back</span>
              <span className="hidden sm:inline">Back to catalog</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label="Toggle color theme"
            title="Toggle color theme"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <SunMoon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </header>
  );
}
