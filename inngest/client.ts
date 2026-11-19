import { eventType, Inngest } from "inngest";

export const inngest = new Inngest({
  id: "tmdb-discovery",
  // Local dev talks to the Inngest Dev Server (`pnpm inngest:dev`) without
  // signing keys; production uses INNGEST_EVENT_KEY / INNGEST_SIGNING_KEY.
  isDev: process.env.NODE_ENV !== "production",
});

/** Ask for an out-of-schedule trending snapshot (e.g. on first run). */
export const trendingSnapshotRequested = eventType("tmdb/trending.snapshot.requested");
