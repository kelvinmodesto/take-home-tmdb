import { HistoryIcon } from "lucide-react";

import { MovieCard, MovieCardSkeleton, toCardData } from "@/components/movie/movie-card";
import { SectionHeading } from "@/components/movie/movie-row";
import { RankMovement } from "@/components/movie/rank-movement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTrendingMovies } from "@/lib/tmdb/api";
import type { MovieSummary } from "@/lib/tmdb/types";
import { getTrendingMovement, type TrendingMovementData } from "@/lib/trending-history";
import { formatDate } from "@/lib/utils";

import { RequestSnapshotButton } from "./request-snapshot-button";

const GRID = "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

export async function TrendingSection() {
  const [today, thisWeek, movement] = await Promise.all([
    getTrendingMovies("day"),
    getTrendingMovies("week"),
    getTrendingMovement(),
  ]);

  return (
    <section aria-label="Trending movies">
      <Tabs defaultValue="day" className="gap-6">
        <SectionHeading
          title="Trending movies"
          description="What everyone's watching, ranked by TMDB activity."
        >
          <TabsList aria-label="Trending time window">
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">This week</TabsTrigger>
          </TabsList>
        </SectionHeading>

        <TabsContent value="day" className="space-y-4">
          <HistoryNote movement={movement} />
          <TrendingGrid movies={today} movement={movement} />
        </TabsContent>
        <TabsContent value="week">
          <TrendingGrid movies={thisWeek} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function TrendingGrid({
  movies,
  movement,
}: {
  movies: MovieSummary[];
  movement?: TrendingMovementData;
}) {
  const hasBaseline = Boolean(movement?.baselineDate);
  return (
    <ol className={GRID}>
      {movies.map((movie, index) => (
        <li key={movie.id}>
          <MovieCard
            movie={toCardData(movie)}
            rank={index + 1}
            priority={index < 5}
            badge={
              movement && (
                <RankMovement
                  rank={index + 1}
                  movement={movement.movies[movie.id]}
                  hasBaseline={hasBaseline}
                />
              )
            }
          />
        </li>
      ))}
    </ol>
  );
}

function HistoryNote({ movement }: { movement: TrendingMovementData }) {
  if (movement.baselineDate) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <HistoryIcon className="size-3.5" />
        Rank changes compared with {formatDate(movement.baselineDate)}.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed bg-card/50 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        <HistoryIcon className="mr-1.5 inline size-4 align-text-bottom" />
        {movement.latestSnapshotDate
          ? "Tracking started today. Rank movement and streaks appear after tomorrow's snapshot."
          : "Rank movement and streaks appear once the daily Inngest snapshot job has run."}
      </p>
      {!movement.latestSnapshotDate && <RequestSnapshotButton />}
    </div>
  );
}

export function TrendingSectionSkeleton() {
  return (
    <section className="space-y-6" aria-busy>
      <SectionHeading title="Trending movies" />
      <div className={GRID}>
        {Array.from({ length: 10 }, (_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
