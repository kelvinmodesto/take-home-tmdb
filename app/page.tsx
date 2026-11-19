import { Suspense } from "react";

import { toCardData } from "@/components/movie/movie-card";
import { MovieRow, MovieRowSkeleton } from "@/components/movie/movie-row";
import { getMovieList, hasTmdbCredentials } from "@/lib/tmdb/api";
import type { MovieListKind } from "@/lib/tmdb/types";

import { Hero, HeroSkeleton } from "./_components/hero";
import { SetupNotice } from "./_components/setup-notice";
import { TrendingSection, TrendingSectionSkeleton } from "./_components/trending-section";

const ROWS: { list: MovieListKind; title: string; description: string }[] = [
  { list: "now_playing", title: "In theaters", description: "Now playing in US cinemas." },
  { list: "upcoming", title: "Coming soon", description: "Mark your calendar." },
  { list: "popular", title: "Popular", description: "The most-watched titles on TMDB." },
  { list: "top_rated", title: "All-time top rated", description: "Highest rated by the TMDB community." },
];

export default function HomePage() {
  if (!hasTmdbCredentials()) return <SetupNotice />;

  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
      <div className="mx-auto max-w-7xl space-y-14 px-4 sm:px-6">
        <Suspense fallback={<TrendingSectionSkeleton />}>
          <TrendingSection />
        </Suspense>
        {ROWS.map((row) => (
          <Suspense key={row.list} fallback={<MovieRowSkeleton title={row.title} />}>
            <ListRow {...row} />
          </Suspense>
        ))}
      </div>
    </>
  );
}

async function ListRow({ list, title, description }: (typeof ROWS)[number]) {
  const movies = await getMovieList(list);
  return <MovieRow title={title} description={description} movies={movies.map(toCardData)} />;
}
