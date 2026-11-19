"use client";

import { useQuery } from "@tanstack/react-query";
import { BookmarkIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { MovieCard, MovieCardSkeleton } from "@/components/movie/movie-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/client";

const GRID = "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

type Sort = "recent" | "rating" | "release" | "title";

export function WatchlistView() {
  const trpc = useTRPC();
  const { data, isPending, isError, error } = useQuery(trpc.watchlist.list.queryOptions());
  const [sort, setSort] = useState<Sort>("recent");

  const items = useMemo(() => {
    const list = [...(data ?? [])];
    switch (sort) {
      case "rating":
        return list.sort((a, b) => (b.voteAverage ?? 0) - (a.voteAverage ?? 0));
      case "release":
        return list.sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""));
      case "title":
        return list.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list; // already newest-first from the server
    }
  }, [data, sort]);

  if (isPending) {
    return (
      <div className={GRID}>
        {Array.from({ length: 6 }, (_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) return <p className="text-destructive">Couldn&apos;t load your watchlist: {error.message}</p>;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
          <BookmarkIcon className="size-5 text-muted-foreground" />
        </span>
        <div>
          <p className="font-medium">Nothing saved yet</p>
          <p className="text-sm text-muted-foreground">
            Tap the bookmark on any movie to keep track of what you want to watch.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Browse trending movies</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {items.length} movie{items.length === 1 ? "" : "s"}
        </p>
        <Tabs value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <TabsList aria-label="Sort watchlist">
            <TabsTrigger value="recent">Recently added</TabsTrigger>
            <TabsTrigger value="rating">Rating</TabsTrigger>
            <TabsTrigger value="release">Release</TabsTrigger>
            <TabsTrigger value="title">A–Z</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ul className={GRID}>
        {items.map((item) => (
          <li key={item.id}>
            <MovieCard
              movie={{
                id: item.movieId,
                title: item.title,
                posterPath: item.posterPath,
                releaseDate: item.releaseDate,
                voteAverage: item.voteAverage,
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
