import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type {
  Genre,
  MovieDetails,
  MovieListKind,
  MovieSummary,
  Paginated,
  TimeWindow,
} from "./types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

export function hasTmdbCredentials() {
  return Boolean(process.env.TMDB_API_READ_ACCESS_TOKEN || process.env.TMDB_API_KEY);
}

/**
 * Low-level, uncached TMDB request. Supports either the v4 read access token
 * (preferred) or a legacy v3 `api_key`.
 */
async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  const token = process.env.TMDB_API_READ_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) {
    throw new TmdbError(
      "Missing TMDB credentials. Set TMDB_API_READ_ACCESS_TOKEN in .env (see .env.example).",
      401,
    );
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  for (const [key, value] of Object.entries({ language: "en-US", ...params })) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  if (!token && apiKey) url.searchParams.set("api_key", apiKey);

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { status_message?: string } | null;
    throw new TmdbError(
      `TMDB ${res.status} for ${path}: ${body?.status_message ?? res.statusText}`,
      res.status,
    );
  }

  return (await res.json()) as T;
}

/** Uncached on purpose: the Inngest snapshot job needs the live list. */
export function fetchTrendingMoviesUncached(timeWindow: TimeWindow = "day") {
  return tmdbFetch<Paginated<MovieSummary>>(`/trending/movie/${timeWindow}`);
}

export async function getTrendingMovies(timeWindow: TimeWindow = "day") {
  "use cache";
  cacheLife("hours");
  cacheTag("tmdb", `tmdb:trending:${timeWindow}`);

  const data = await fetchTrendingMoviesUncached(timeWindow);
  return data.results;
}

export async function getMovieList(list: MovieListKind) {
  "use cache";
  cacheLife("hours");
  cacheTag("tmdb", `tmdb:list:${list}`);

  const data = await tmdbFetch<Paginated<MovieSummary>>(`/movie/${list}`, {
    region: list === "now_playing" || list === "upcoming" ? "US" : undefined,
  });
  return data.results;
}

/** Returns `null` when TMDB has no movie with this id. */
export async function getMovieDetails(id: number): Promise<MovieDetails | null> {
  "use cache";
  cacheLife("days");
  cacheTag("tmdb", `tmdb:movie:${id}`);

  try {
    return await tmdbFetch<MovieDetails>(`/movie/${id}`, {
      append_to_response: "credits,videos,recommendations,release_dates,watch/providers",
    });
  } catch (error) {
    if (error instanceof TmdbError && error.status === 404) return null;
    throw error;
  }
}

export async function searchMovies(query: string, page = 1) {
  "use cache";
  cacheLife("hours");
  cacheTag("tmdb", "tmdb:search");

  return tmdbFetch<Paginated<MovieSummary>>("/search/movie", {
    query,
    page,
    include_adult: false,
  });
}

export async function getMovieGenres(): Promise<Record<number, string>> {
  "use cache";
  cacheLife("weeks");
  cacheTag("tmdb", "tmdb:genres");

  const { genres } = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list");
  return Object.fromEntries(genres.map((g) => [g.id, g.name]));
}
