import { InfoIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";

import { ScoreRing } from "@/components/movie/score-ring";
import { TmdbImage } from "@/components/movie/tmdb-image";
import { WatchlistButton } from "@/components/movie/watchlist-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMovieGenres, getTrendingMovies } from "@/lib/tmdb/api";
import { releaseYear } from "@/lib/utils";

/** Full-bleed feature of today's #1 trending movie, with the runners-up alongside. */
export async function Hero() {
  const [trending, genres] = await Promise.all([getTrendingMovies("day"), getMovieGenres()]);
  const [featured, ...rest] = trending;
  if (!featured) return null;

  const runnersUp = rest.slice(0, 4);
  const year = releaseYear(featured.release_date);

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <TmdbImage
          path={featured.backdrop_path}
          kind="backdrop"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/40" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-16 pb-12 sm:px-6 md:pt-28 lg:grid-cols-[1fr_320px] lg:pb-16">
        <div className="max-w-2xl space-y-5">
          <Badge variant="muted" className="gap-1.5 px-2.5 py-1 text-xs">
            <TrendingUpIcon className="text-primary" />
            #1 trending today
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-balance text-white drop-shadow sm:text-5xl lg:text-6xl">
            {featured.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/80">
            <ScoreRing voteAverage={featured.vote_average} voteCount={featured.vote_count} size={44} />
            {year && <span className="font-medium">{year}</span>}
            {featured.genre_ids.slice(0, 3).map((id) =>
              genres[id] ? (
                <span key={id} className="rounded-full border border-white/20 px-2.5 py-0.5 text-xs">
                  {genres[id]}
                </span>
              ) : null,
            )}
          </div>
          <p className="line-clamp-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {featured.overview}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild size="lg">
              <Link href={`/movie/${featured.id}`}>
                <InfoIcon /> More info
              </Link>
            </Button>
            <WatchlistButton
              className="h-10 bg-white/10 text-white backdrop-blur hover:bg-white/20 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              movie={{
                movieId: featured.id,
                title: featured.title,
                posterPath: featured.poster_path,
                releaseDate: featured.release_date || null,
                voteAverage: featured.vote_average,
              }}
            />
          </div>
        </div>

        <aside className="hidden self-end lg:block" aria-label="Also trending today">
          <p className="mb-3 text-xs font-semibold tracking-widest text-white/60 uppercase">
            Also trending
          </p>
          <ol className="space-y-2">
            {runnersUp.map((movie, i) => (
              <li key={movie.id}>
                <Link
                  href={`/movie/${movie.id}`}
                  className="group flex items-center gap-3 rounded-lg border border-white/5 bg-black/40 p-2 backdrop-blur transition hover:border-primary/50 hover:bg-black/60"
                >
                  <span className="w-5 text-center text-lg font-bold text-white/50 tabular-nums">
                    {i + 2}
                  </span>
                  <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded">
                    <TmdbImage
                      path={movie.poster_path}
                      kind="poster"
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white group-hover:text-primary">
                      {movie.title}
                    </p>
                    <p className="text-xs text-white/60">{releaseYear(movie.release_date)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="mx-auto max-w-7xl space-y-5 px-4 pt-28 pb-16 sm:px-6">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-14 w-2/3 max-w-xl" />
      <Skeleton className="h-5 w-64" />
      <Skeleton className="h-20 w-full max-w-xl" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
    </section>
  );
}
