import "server-only";

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@/lib/db";
import { TmdbError } from "@/lib/tmdb/api";

const VISITOR_COOKIE = "visitor_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function readCookie(headers: Headers, name: string) {
  const match = headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function createTRPCContext(opts: { headers: Headers; resHeaders: Headers }) {
  return {
    db,
    headers: opts.headers,
    resHeaders: opts.resHeaders,
    visitorId: readCookie(opts.headers, VISITOR_COOKIE),
  };
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.issues : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/** Translates TMDB failures into tRPC errors with useful codes. */
const tmdbErrors = t.middleware(async ({ next }) => {
  const result = await next();
  if (!result.ok && result.error.cause instanceof TmdbError) {
    const { status, message } = result.error.cause;
    throw new TRPCError({
      code: status === 404 ? "NOT_FOUND" : status === 401 ? "UNAUTHORIZED" : "BAD_GATEWAY",
      message,
      cause: result.error.cause,
    });
  }
  return result;
});

export const publicProcedure = t.procedure.use(tmdbErrors);

/**
 * There are no accounts: each browser gets an anonymous id in an httpOnly
 * cookie, created lazily the first time it's needed.
 */
export const visitorProcedure = publicProcedure.use(({ ctx, next }) => {
  let visitorId = ctx.visitorId;
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    ctx.resHeaders.append(
      "Set-Cookie",
      [
        `${VISITOR_COOKIE}=${visitorId}`,
        "Path=/",
        `Max-Age=${ONE_YEAR_SECONDS}`,
        "SameSite=Lax",
        "HttpOnly",
        process.env.NODE_ENV === "production" ? "Secure" : "",
      ]
        .filter(Boolean)
        .join("; "),
    );
  }
  return next({ ctx: { ...ctx, visitorId } });
});
