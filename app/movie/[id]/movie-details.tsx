import { ExternalLinkIcon, FlameIcon, TrophyIcon } from "lucide-react";

import { Suspense } from "react";

import { toCardData } from "@/components/movie/movie-card";
import { MovieRow, SectionHeading } from "@/components/movie/movie-row";
import { ScoreRing } from "@/components/movie/score-ring";
import { TmdbImage } from "@/components/movie/tmdb-image";
import { WatchlistButton } from "@/components/movie/watchlist-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MovieDetails as MovieDetailsData } from "@/lib/tmdb/types";
import { getMovieTrendingHistory } from "@/lib/trending-history";
import {
  formatDate,
  formatMoney,
  formatRuntime,
  languageName,
  releaseYear,
} from "@/lib/utils";

import { TrailerDialog } from "./trailer-dialog";

const KEY_JOBS = ["Director", "Screenplay", "Writer", "Story", "Novel", "Characters", "Original Music Composer"];

function keyCrew(movie: MovieDetailsData) {
  const people = new Map<number, { id: number; name: string; jobs: string[] }>();
  for (const member of movie.credits.crew) {
    if (!KEY_JOBS.includes(member.job)) continue;
    const entry = people.get(member.id) ?? { id: member.id, name: member.name, jobs: [] };
    if (!entry.jobs.includes(member.job)) entry.jobs.push(member.job);
    people.set(member.id, entry);
  }
  return [...people.values()]
    .sort((a, b) => KEY_JOBS.indexOf(a.jobs[0]) - KEY_JOBS.indexOf(b.jobs[0]))
    .slice(0, 6);
}

function usCertification(movie: MovieDetailsData) {
  const us = movie.release_dates.results.find((r) => r.iso_3166_1 === "US");
  const dates = us?.release_dates ?? [];
  // Prefer the theatrical (type 3) rating, then any non-empty one.
  return (
    dates.find((d) => d.type === 3 && d.certification)?.certification ??
    dates.find((d) => d.certification)?.certification ??
    null
  );
}

function bestTrailer(movie: MovieDetailsData) {
  const youtube = movie.videos.results.filter((v) => v.site === "YouTube");
  return (
    youtube.find((v) => v.type === "Trailer" && v.official) ??
    youtube.find((v) => v.type === "Trailer") ??
    youtube.find((v) => v.type === "Teaser") ??
    null
  );
}

export function MovieDetails({ movie }: { movie: MovieDetailsData }) {
  const year = releaseYear(movie.release_date);
  const certification = usCertification(movie);
  const runtime = formatRuntime(movie.runtime);
  const trailer = bestTrailer(movie);
  const crew = keyCrew(movie);
  const cast = movie.credits.cast.slice(0, 15);
  const providers = movie["watch/providers"].results.US;
  const recommendations = movie.recommendations.results.filter((m) => m.poster_path).slice(0, 20);

  return (
    <article>
      {/* Header */}
      <section className="relative isolate overflow-hidden border-b">
        <div className="absolute inset-0 -z-10">
          <TmdbImage
            path={movie.backdrop_path}
            kind="backdrop"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[260px_1fr] md:py-14 lg:grid-cols-[300px_1fr]">
          <div className="relative mx-auto aspect-[2/3] w-52 overflow-hidden rounded-xl border shadow-2xl shadow-black/50 md:w-full">
            <TmdbImage
              path={movie.poster_path}
              kind="poster"
              alt={`${movie.title} poster`}
              fill
              priority
              sizes="(min-width: 1024px) 300px, (min-width: 768px) 260px, 208px"
              className="object-cover"
            />
          </div>

          <div className="space-y-6 self-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                {movie.title}{" "}
                {year && <span className="font-light text-muted-foreground">({year})</span>}
              </h1>
              {movie.original_title !== movie.title && (
                <p className="text-sm text-muted-foreground">Original title: {movie.original_title}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground">
                {certification && (
                  <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground">
                    {certification}
                  </Badge>
                )}
                {movie.release_date && <span>{formatDate(movie.release_date)}</span>}
                {runtime && <span aria-hidden>•</span>}
                {runtime && <span>{runtime}</span>}
                {movie.genres.length > 0 && <span aria-hidden>•</span>}
                {movie.genres.map((g) => (
                  <Badge key={g.id} variant="secondary" className="font-normal">
                    {g.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2.5">
                <ScoreRing voteAverage={movie.vote_average} voteCount={movie.vote_count} size={60} />
                <div className="text-sm leading-tight">
                  <p className="font-semibold">User score</p>
                  <p className="text-xs text-muted-foreground">
                    {movie.vote_count.toLocaleString("en-US")} votes
                  </p>
                </div>
              </div>
              <WatchlistButton
                movie={{
                  movieId: movie.id,
                  title: movie.title,
                  posterPath: movie.poster_path,
                  releaseDate: movie.release_date || null,
                  voteAverage: movie.vote_average,
                }}
              />
              {trailer && <TrailerDialog videoKey={trailer.key} title={`${movie.title} – ${trailer.name}`} />}
            </div>

            {movie.tagline && <p className="text-lg text-muted-foreground italic">{movie.tagline}</p>}

            {movie.overview && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Overview</h2>
                <p className="max-w-3xl leading-relaxed text-foreground/90">{movie.overview}</p>
              </div>
            )}

            {crew.length > 0 && (
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {crew.map((person) => (
                  <div key={person.id}>
                    <dt className="font-semibold">{person.name}</dt>
                    <dd className="text-sm text-muted-foreground">{person.jobs.join(", ")}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-10 sm:px-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-12">
          {cast.length > 0 && (
            <section className="space-y-4" aria-label="Top billed cast">
              <SectionHeading title="Top billed cast" />
              <ul className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
                {cast.map((person) => (
                  <li
                    key={`${person.id}-${person.character}`}
                    className="w-32 shrink-0 snap-start overflow-hidden rounded-lg border bg-card"
                  >
                    <div className="relative aspect-[2/3] bg-muted">
                      <TmdbImage
                        path={person.profile_path}
                        kind="profile"
                        alt={person.name}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="line-clamp-2 text-sm leading-tight font-semibold">{person.name}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {person.character}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <MovieRow
            title="If you liked this"
            description="Recommendations from TMDB."
            movies={recommendations.map(toCardData)}
          />
        </div>

        <aside className="space-y-8 text-sm">
          <Suspense fallback={<Skeleton className="h-28 w-full" />}>
            <TrendingHistory movieId={movie.id} />
          </Suspense>

          {providers && (providers.flatrate?.length ?? 0) > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold">Streaming in the US</h2>
              <ul className="flex flex-wrap gap-2">
                {providers.flatrate!.slice(0, 8).map((p) => (
                  <li key={p.provider_id}>
                    <a
                      href={providers.link}
                      target="_blank"
                      rel="noreferrer"
                      title={p.provider_name}
                      className="relative block size-11 overflow-hidden rounded-lg border transition hover:scale-105"
                    >
                      <TmdbImage path={p.logo_path} kind="logo" alt={p.provider_name} fill sizes="44px" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">Availability data from JustWatch.</p>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="font-semibold">Details</h2>
            <dl className="space-y-3">
              <Fact label="Status" value={movie.status} />
              <Fact label="Original language" value={languageName(movie.original_language)} />
              <Fact label="Budget" value={formatMoney(movie.budget)} />
              <Fact label="Revenue" value={formatMoney(movie.revenue)} />
              <Fact
                label="Production"
                value={movie.production_companies.slice(0, 3).map((c) => c.name).join(", ") || null}
              />
            </dl>
          </section>

          <div className="flex flex-wrap gap-2">
            {movie.homepage && (
              <Button asChild variant="outline" size="sm">
                <a href={movie.homepage} target="_blank" rel="noreferrer">
                  Official site <ExternalLinkIcon />
                </a>
              </Button>
            )}
            {movie.imdb_id && (
              <Button asChild variant="outline" size="sm">
                <a href={`https://www.imdb.com/title/${movie.imdb_id}/`} target="_blank" rel="noreferrer">
                  IMDb <ExternalLinkIcon />
                </a>
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <a
                href={`https://www.themoviedb.org/movie/${movie.id}`}
                target="_blank"
                rel="noreferrer"
              >
                TMDB <ExternalLinkIcon />
              </a>
            </Button>
          </div>
        </aside>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

/** Trending history from our own daily snapshots (see inngest/functions.ts). */
async function TrendingHistory({ movieId }: { movieId: number }) {
  const history = await getMovieTrendingHistory(movieId);
  if (history.daysTrending === 0) return null;

  return (
    <section className="space-y-3 rounded-lg border bg-card p-4">
      <h2 className="flex items-center gap-2 font-semibold">
        <FlameIcon className="size-4 text-highlight" /> Trending history
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-2xl font-bold tabular-nums">{history.daysTrending}</p>
          <p className="text-xs text-muted-foreground">
            day{history.daysTrending === 1 ? "" : "s"} trending
          </p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-2xl font-bold tabular-nums">
            <TrophyIcon className="size-4 text-yellow-400" />#{history.bestRank}
          </p>
          <p className="text-xs text-muted-foreground">best rank</p>
        </div>
      </div>
      {history.recent.length > 1 && (
        <div
          className="flex h-12 items-end gap-1"
          role="img"
          aria-label={`Daily ranks: ${history.recent.map((r) => `#${r.rank}`).join(", ")}`}
        >
          {history.recent.map((r) => (
            <div
              key={r.date}
              title={`${formatDate(r.date)}: #${r.rank}`}
              className="flex-1 rounded-sm bg-primary/70"
              style={{ height: `${Math.max(8, ((21 - r.rank) / 20) * 100)}%` }}
            />
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        First spotted {formatDate(history.firstSeen)}
        {history.lastSeen !== history.firstSeen && <> · last seen {formatDate(history.lastSeen)}</>}
      </p>
    </section>
  );
}
