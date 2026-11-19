import { TRPCError } from "@trpc/server";

import { inngest, trendingSnapshotRequested } from "@/inngest/client";

import { createTRPCRouter, publicProcedure } from "../init";

export const trendingRouter = createTRPCRouter({
  /** Queue an out-of-schedule snapshot (the job is idempotent per UTC day). */
  requestSnapshot: publicProcedure.mutation(async () => {
    try {
      const { ids } = await inngest.send(trendingSnapshotRequested.create());
      return { eventIds: ids };
    } catch (error) {
      throw new TRPCError({
        code: "SERVICE_UNAVAILABLE",
        message: "Couldn't reach Inngest. Is the dev server running? (pnpm inngest:dev)",
        cause: error,
      });
    }
  }),
});
