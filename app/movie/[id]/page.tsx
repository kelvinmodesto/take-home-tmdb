import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getMovieDetails } from "@/lib/tmdb/api";
import { tmdbImageUrl } from "@/lib/tmdb/images";
import { parseMovieId, releaseYear } from "@/lib/utils";

import { MovieDetails } from "./movie-details";
import { MovieDetailsSkeleton } from "./movie-details-skeleton";


export async function generateMetadata({ params }: PageProps<"/movie/[id]">): Promise<Metadata> {
  const id = parseMovieId((await params).id);
  const movie = id ? await getMovieDetails(id) : null;
  if (!movie) return { title: "Movie not found" };

  const year = releaseYear(movie.release_date);
  return {
    title: year ? `${movie.title} (${year})` : movie.title,
    description: movie.overview || movie.tagline || undefined,
    openGraph: movie.backdrop_path
      ? { images: [{ url: tmdbImageUrl(movie.backdrop_path, "backdrop", 1280), width: 1280 }] }
      : undefined,
  };
}

export default function MoviePage({ params }: PageProps<"/movie/[id]">) {
  // The route's App Shell is shared by every movie link, so the param-dependent
  // content lives inside Suspense and streams in after navigation.
  return (
    <Suspense fallback={<MovieDetailsSkeleton />}>
      <MovieContent params={params} />
    </Suspense>
  );
}

async function MovieContent({ params }: Pick<PageProps<"/movie/[id]">, "params">) {
  const id = parseMovieId((await params).id);
  if (!id) notFound();

  const movie = await getMovieDetails(id);
  if (!movie) notFound();

  return <MovieDetails movie={movie} />;
}
