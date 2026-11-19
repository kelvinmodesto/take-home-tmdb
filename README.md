# Matinee: movie discovery on TMDB

A movie discovery homepage in the style of Letterboxd and TMDB, built on the [TMDB API](https://developer.themoviedb.org/docs/getting-started).

## Features

- **Hero.** Shows today's #1 trending movie with its backdrop, plus the runners-up.
- **Trending movies.** A ranked grid with **Today** and **This week** tabs.
  - **Rank movement and streaks.** TMDB doesn't provide these. An Inngest cron job saves the trending list every day, and the app compares today's ranks against that history (▲3, ▼2, NEW, 🔥 5d).
- **Curated rows.** In theaters, Coming soon, Popular, and All-time top rated.
- **Movie pages** (`/movie/[id]`). Each page has:
  - backdrop, poster, certification, runtime, genres, and score
  - tagline, overview, and key crew
  - a trailer that plays in a dialog
  - top-billed cast
  - US streaming providers
  - budget and revenue
  - recommendations
  - the movie's own trending history and best rank
- **Search.** Press <kbd>⌘K</kbd> or <kbd>/</kbd>. Results update as you type, and you can move through them with the keyboard.
- **Watchlist.** Bookmark any movie (updates show instantly) and browse your list at `/watchlist`, sorted four ways. There are no accounts: each browser gets an anonymous httpOnly cookie.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 App Router with Cache Components and Partial Prefetching |
| UI | React 19, Tailwind CSS v4, shadcn/ui components on `radix-ui` |
| API | tRPC v11 with `@trpc/tanstack-react-query` and superjson |
| DB | Prisma 7 with SQLite (via `@prisma/adapter-libsql`) |
| Background jobs | Inngest v4 |

### How the pieces fit

- **TMDB reads** live in `lib/tmdb/api.ts` and use `'use cache'` with `cacheLife`/`cacheTag`.
  - The homepage is fully prerendered and revalidates hourly.
  - Movie pages prerender a shared App Shell, and the content for the specific movie streams in behind `<Suspense>`.
- **tRPC** (`trpc/`, `app/api/trpc/[trpc]`) handles interactive features: search, watchlist, and starting a snapshot.
- **Prisma** (`prisma/schema.prisma`, `lib/db.ts`) stores `WatchlistItem` and `TrendingSnapshot` rows.
- **Inngest** (`inngest/`, `app/api/inngest`) runs `snapshot-trending-movies`.
  - It runs every 6 hours (UTC) and also on the `tmdb/trending.snapshot.requested` event.
  - It replaces the current day's snapshot, deletes rows older than 90 days, and calls `revalidateTag('trending-history')`.
- **Images** go through a custom `next/image` loader (`components/movie/tmdb-image.tsx`). It picks the closest pre-sized TMDB rendition instead of re-encoding the image on the server.

## Getting started

```bash
pnpm install                # also runs `prisma generate`
cp .env.example .env        # then paste your TMDB "API Read Access Token"
pnpm db:migrate             # creates ./dev.db
pnpm dev                    # http://localhost:3000
```

Run the Inngest Dev Server in a second terminal so the snapshot job can run:

```bash
pnpm inngest:dev            # dashboard at http://localhost:8288
```

On a fresh database, the trending section shows a **Take first snapshot** button. You can also start the function from the Inngest dashboard. Rank movement appears after snapshots exist for two different days.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` / `build` / `start` | Next.js |
| `pnpm typecheck` | `next typegen` + `tsc` |
| `pnpm lint` | ESLint |
| `pnpm db:migrate` / `db:deploy` / `db:studio` | Prisma |
| `pnpm inngest:dev` | Local Inngest Dev Server |

---

This product uses the TMDB API but is not endorsed or certified by TMDB.
