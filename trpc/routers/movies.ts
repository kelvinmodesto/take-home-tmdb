import { z } from "zod";

import { getMovieDetails, getMovieList, getTrendingMovies, searchMovies } from "@/lib/tmdb/api";

import { createTRPCRouter, publicProcedure } from "../init";

export const moviesRouter = createTRPCRouter({
  trending: publicProcedure
    .input(z.object({ timeWindow: z.enum(["day", "week"]).default("day") }))
    .query(({ input }) => getTrendingMovies(input.timeWindow)),

  list: publicProcedure
    .input(z.object({ list: z.enum(["popular", "top_rated", "now_playing", "upcoming"]) }))
    .query(({ input }) => getMovieList(input.list)),

  details: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(({ input }) => getMovieDetails(input.id)),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().trim().min(1).max(100),
        page: z.number().int().min(1).max(500).default(1),
      }),
    )
    .query(async ({ input }) => {
      const data = await searchMovies(input.query, input.page);
      return {
        page: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
        results: data.results.map((m) => ({
          id: m.id,
          title: m.title,
          posterPath: m.poster_path,
          releaseDate: m.release_date,
          voteAverage: m.vote_average,
          overview: m.overview,
        })),
      };
    }),
});
