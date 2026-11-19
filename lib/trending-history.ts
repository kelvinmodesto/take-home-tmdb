import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/lib/db";
import { utcDateKey } from "@/lib/utils";

export const TRENDING_HISTORY_TAG = "trending-history";

export interface RankMovement {
  /** Rank on the most recent snapshot before today, or null if it wasn't trending. */
  previousRank: number | null;
  /** Consecutive snapshot days (ending with the latest) the movie appeared on. */
  streak: number;
}

export interface TrendingMovementData {
  baselineDate: string | null;
  latestSnapshotDate: string | null;
  movies: Record<string, RankMovement>;
}

/**
 * Rank movement for the "trending today" list, computed from the daily
 * snapshots the Inngest job writes. Returns empty data (not an error) when no
 * snapshots exist yet so the homepage still renders on a fresh install.
 */
export async function getTrendingMovement(): Promise<TrendingMovementData> {
  "use cache";
  cacheLife("hours");
  cacheTag(TRENDING_HISTORY_TAG);

  const empty: TrendingMovementData = { baselineDate: null, latestSnapshotDate: null, movies: {} };

  try {
    const dates = (
      await db.trendingSnapshot.findMany({
        distinct: ["date"],
        select: { date: true },
        orderBy: { date: "desc" },
        take: 60,
      })
    ).map((d) => d.date);
    if (dates.length === 0) return empty;

    const today = utcDateKey();
    const baselineDate = dates.find((d) => d < today) ?? null;

    const snapshots = await db.trendingSnapshot.findMany({
      where: { date: { in: dates } },
      select: { movieId: true, date: true, rank: true },
    });

    const byMovie = new Map<number, Map<string, number>>();
    for (const s of snapshots) {
      if (!byMovie.has(s.movieId)) byMovie.set(s.movieId, new Map());
      byMovie.get(s.movieId)!.set(s.date, s.rank);
    }

    const movies: Record<string, RankMovement> = {};
    for (const [movieId, ranks] of byMovie) {
      let streak = 0;
      for (const date of dates) {
        if (!ranks.has(date)) break;
        streak++;
      }
      movies[movieId] = {
        previousRank: baselineDate ? (ranks.get(baselineDate) ?? null) : null,
        streak,
      };
    }

    return { baselineDate, latestSnapshotDate: dates[0], movies };
  } catch (error) {
    console.warn("[trending-history] Could not read snapshots:", error);
    return empty;
  }
}

export interface MovieTrendingHistory {
  daysTrending: number;
  bestRank: number | null;
  firstSeen: string | null;
  lastSeen: string | null;
  recent: { date: string; rank: number }[];
}

export async function getMovieTrendingHistory(movieId: number): Promise<MovieTrendingHistory> {
  "use cache";
  cacheLife("hours");
  cacheTag(TRENDING_HISTORY_TAG);

  try {
    const rows = await db.trendingSnapshot.findMany({
      where: { movieId },
      select: { date: true, rank: true },
      orderBy: { date: "asc" },
    });
    return {
      daysTrending: rows.length,
      bestRank: rows.length ? Math.min(...rows.map((r) => r.rank)) : null,
      firstSeen: rows[0]?.date ?? null,
      lastSeen: rows.at(-1)?.date ?? null,
      recent: rows.slice(-14),
    };
  } catch (error) {
    console.warn("[trending-history] Could not read snapshots:", error);
    return { daysTrending: 0, bestRank: null, firstSeen: null, lastSeen: null, recent: [] };
  }
}
