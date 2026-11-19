import { createTRPCRouter } from "../init";
import { moviesRouter } from "./movies";
import { trendingRouter } from "./trending";
import { watchlistRouter } from "./watchlist";

export const appRouter = createTRPCRouter({
  movies: moviesRouter,
  trending: trendingRouter,
  watchlist: watchlistRouter,
});

export type AppRouter = typeof appRouter;
