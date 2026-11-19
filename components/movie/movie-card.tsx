import Link from "next/link";

import type { MovieSummary } from "@/lib/tmdb/types";
import { cn, releaseYear } from "@/lib/utils";

import { ScoreRing } from "./score-ring";
import { TmdbImage } from "./tmdb-image";
import { WatchlistButton } from "./watchlist-button";

export interface MovieCardData {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  voteCount?: number;
}

export function toCardData(movie: MovieSummary): MovieCardData {
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    releaseDate: movie.release_date || null,
    voteAverage: movie.vote_average,
    voteCount: movie.vote_count,
  };
}

export function MovieCard({
  movie,
  rank,
  badge,
  priority,
  sizes = "(min-width: 1280px) 15vw, (min-width: 768px) 22vw, 45vw",
  className,
}: {
  movie: MovieCardData;
  rank?: number;
  /** Extra content under the title, e.g. rank movement. */
  badge?: React.ReactNode;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const year = releaseYear(movie.releaseDate);

  return (
    <article className={cn("group relative", className)}>
      <Link
        href={`/movie/${movie.id}`}
        className="block rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg border bg-muted shadow-lg shadow-black/30 transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/70 group-hover:shadow-primary/10">
          <TmdbImage
            path={movie.posterPath}
            kind="poster"
            alt={`${movie.title} poster`}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          {rank !== undefined && (
            <span className="absolute top-0 left-0 rounded-br-lg bg-black/75 px-2 py-1 text-sm font-bold tabular-nums text-white backdrop-blur">
              {rank}
            </span>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition group-hover:opacity-100" />
        </div>
        <ScoreRing
          voteAverage={movie.voteAverage}
          voteCount={movie.voteCount}
          size={36}
          className="relative -mt-[18px] ml-2 ring-2 ring-background"
        />
        <h3 className="mt-1.5 line-clamp-2 text-sm leading-snug font-semibold text-foreground group-hover:text-primary">
          {movie.title}
        </h3>
      </Link>
      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {year && <span>{year}</span>}
        {badge}
      </div>
      <WatchlistButton
        variant="icon"
        className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100 aria-pressed:opacity-100"
        movie={{
          movieId: movie.id,
          title: movie.title,
          posterPath: movie.posterPath,
          releaseDate: movie.releaseDate,
          voteAverage: movie.voteAverage,
        }}
      />
    </article>
  );
}

export function MovieCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="aspect-[2/3] animate-pulse rounded-lg bg-muted" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
    </div>
  );
}
