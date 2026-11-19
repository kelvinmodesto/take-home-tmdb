/** Shapes of the TMDB v3 responses we use. Only the fields the app reads are typed. */

export type TimeWindow = "day" | "week";

export type MovieListKind = "popular" | "top_rated" | "now_playing" | "upcoming";

export interface Paginated<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface MovieSummary {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface ReleaseDates {
  results: {
    iso_3166_1: string;
    release_dates: { certification: string; type: number; release_date: string }[];
  }[];
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface WatchProviders {
  results: Record<
    string,
    {
      link: string;
      flatrate?: WatchProvider[];
      rent?: WatchProvider[];
      buy?: WatchProvider[];
    }
  >;
}

export interface MovieDetails extends Omit<MovieSummary, "genre_ids"> {
  genres: Genre[];
  runtime: number | null;
  tagline: string | null;
  status: string;
  budget: number;
  revenue: number;
  homepage: string | null;
  imdb_id: string | null;
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  credits: { cast: CastMember[]; crew: CrewMember[] };
  videos: { results: Video[] };
  recommendations: Paginated<MovieSummary>;
  release_dates: ReleaseDates;
  "watch/providers": WatchProviders;
}
