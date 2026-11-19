"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { LoaderCircleIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { ScoreRing } from "@/components/movie/score-ring";
import { TmdbImage } from "@/components/movie/tmdb-image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn, releaseYear } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);
  return debounced;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((o) => !o);
      } else if (event.key === "/" && !(event.target instanceof HTMLInputElement)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-9 w-9 justify-start gap-2 px-0 text-muted-foreground sm:w-56 sm:px-3"
        aria-label="Search movies"
      >
        <SearchIcon className="mx-auto sm:mx-0" />
        <span className="hidden sm:inline">Search movies…</span>
        <kbd className="pointer-events-none ml-auto hidden rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-[12%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          <DialogTitle className="sr-only">Search movies</DialogTitle>
          <DialogDescription className="sr-only">
            Type a title, then use the arrow keys and Enter to open a movie.
          </DialogDescription>
          {/* Remount on open so the query resets each time. */}
          {open && <SearchPanel onNavigate={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchPanel({ onNavigate }: { onNavigate: () => void }) {
  const trpc = useTRPC();
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const debounced = useDebounced(query.trim(), 250);

  const { data, isFetching, isError, error } = useQuery(
    trpc.movies.search.queryOptions(
      { query: debounced },
      { enabled: debounced.length >= 2, placeholderData: keepPreviousData },
    ),
  );
  const results = debounced.length >= 2 ? (data?.results.slice(0, 8) ?? []) : [];

  const go = (id: number) => {
    onNavigate();
    router.push(`/movie/${id}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[Math.min(active, results.length - 1)].id);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 border-b px-4">
        {isFetching ? (
          <LoaderCircleIcon className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <SearchIcon className="size-5 text-muted-foreground" />
        )}
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search for a movie…"
          className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
        />
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {isError ? (
          <p className="p-6 text-center text-sm text-destructive">{error.message}</p>
        ) : debounced.length < 2 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Start typing to search TMDB&apos;s catalogue.
          </p>
        ) : results.length === 0 && !isFetching ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No movies found for &ldquo;{debounced}&rdquo;.
          </p>
        ) : (
          <ul id={listId} role="listbox" className="p-2">
            {results.map((movie, index) => (
              <li
                key={movie.id}
                id={`${listId}-${movie.id}`}
                role="option"
                aria-selected={index === active}
              >
                <Link
                  href={`/movie/${movie.id}`}
                  onClick={onNavigate}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    "flex items-center gap-3 rounded-md p-2 transition-colors",
                    index === active && "bg-accent",
                  )}
                >
                  <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-muted">
                    <TmdbImage
                      path={movie.posterPath}
                      kind="poster"
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {movie.title}{" "}
                      {movie.releaseDate && (
                        <span className="font-normal text-muted-foreground">
                          ({releaseYear(movie.releaseDate)})
                        </span>
                      )}
                    </p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{movie.overview}</p>
                  </div>
                  <ScoreRing voteAverage={movie.voteAverage} size={32} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
