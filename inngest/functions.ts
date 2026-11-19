import { cron } from "inngest";
import { revalidateTag } from "next/cache";

import { db } from "@/lib/db";
import { fetchTrendingMoviesUncached } from "@/lib/tmdb/api";
import { TRENDING_HISTORY_TAG } from "@/lib/trending-history";
import { utcDateKey } from "@/lib/utils";

import { inngest, trendingSnapshotRequested } from "./client";

const RETENTION_DAYS = 90;

/**
 * Records TMDB's "trending today" list once per UTC day (re-running on the same
 * day just refreshes that day's ranks). The homepage uses this history to show
 * rank movement and streaks.
 */
export const snapshotTrendingMovies = inngest.createFunction(
  {
    id: "snapshot-trending-movies",
    name: "Snapshot trending movies",
    triggers: [cron("TZ=UTC 0 */6 * * *"), trendingSnapshotRequested],
    concurrency: { limit: 1 },
    retries: 3,
  },
  async ({ step }) => {
    const date = await step.run("resolve-date", () => utcDateKey());

    const movies = await step.run("fetch-trending", async () => {
      const { results } = await fetchTrendingMoviesUncached("day");
      return results.map((m, index) => ({
        movieId: m.id,
        rank: index + 1,
        title: m.title,
        posterPath: m.poster_path,
        popularity: m.popularity,
        voteAverage: m.vote_average,
      }));
    });

    const saved = await step.run("save-snapshot", async () => {
      await db.$transaction([
        // Replace the day's snapshot so movies that dropped off don't linger.
        db.trendingSnapshot.deleteMany({ where: { date } }),
        db.trendingSnapshot.createMany({ data: movies.map((m) => ({ ...m, date })) }),
      ]);
      return movies.length;
    });

    const pruned = await step.run("prune-old-snapshots", async () => {
      const cutoff = new Date();
      cutoff.setUTCDate(cutoff.getUTCDate() - RETENTION_DAYS);
      const { count } = await db.trendingSnapshot.deleteMany({
        where: { date: { lt: utcDateKey(cutoff) } },
      });
      return count;
    });

    await step.run("revalidate-cache", () => {
      revalidateTag(TRENDING_HISTORY_TAG, "max");
    });

    return { date, saved, pruned };
  },
);

export const functions = [snapshotTrendingMovies];
