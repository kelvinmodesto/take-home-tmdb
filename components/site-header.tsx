import { BookmarkIcon, ClapperboardIcon } from "lucide-react";
import Link from "next/link";

import { SearchDialog } from "@/components/search-dialog";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ClapperboardIcon className="size-4" />
          </span>
          <span className="text-lg">Matinee</span>
        </Link>
        <nav className="ml-2 hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
          <Link href="/" className="rounded-md px-3 py-1.5 transition-colors hover:text-foreground">
            Discover
          </Link>
          <Link
            href="/watchlist"
            className="rounded-md px-3 py-1.5 transition-colors hover:text-foreground"
          >
            Watchlist
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SearchDialog />
          <Button asChild variant="ghost" size="icon" className="sm:hidden">
            <Link href="/watchlist" aria-label="Watchlist">
              <BookmarkIcon />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Data and images from{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noreferrer"
            className="text-info hover:underline"
          >
            TMDB
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
        <p>Built with Next.js, tRPC, Prisma &amp; Inngest.</p>
      </div>
    </footer>
  );
}
