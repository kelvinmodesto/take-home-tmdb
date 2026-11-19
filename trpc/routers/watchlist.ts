import { z } from "zod";

import { createTRPCRouter, publicProcedure, visitorProcedure } from "../init";

const movieInput = z.object({
  movieId: z.number().int().positive(),
  title: z.string().min(1).max(300),
  posterPath: z.string().max(200).nullable(),
  releaseDate: z.string().max(20).nullable(),
  voteAverage: z.number().min(0).max(10).nullable(),
});

export const watchlistRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => {
    if (!ctx.visitorId) return [];
    return ctx.db.watchlistItem.findMany({
      where: { visitorId: ctx.visitorId },
      orderBy: { createdAt: "desc" },
    });
  }),

  /** Lightweight id list so every card can show its saved state from one query. */
  ids: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.visitorId) return [];
    const rows = await ctx.db.watchlistItem.findMany({
      where: { visitorId: ctx.visitorId },
      select: { movieId: true },
    });
    return rows.map((r) => r.movieId);
  }),

  add: visitorProcedure.input(movieInput).mutation(({ ctx, input }) =>
    ctx.db.watchlistItem.upsert({
      where: { visitorId_movieId: { visitorId: ctx.visitorId, movieId: input.movieId } },
      create: { ...input, visitorId: ctx.visitorId },
      update: {},
    }),
  ),

  remove: visitorProcedure
    .input(z.object({ movieId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.watchlistItem.deleteMany({
        where: { visitorId: ctx.visitorId, movieId: input.movieId },
      });
      return { movieId: input.movieId };
    }),
});
