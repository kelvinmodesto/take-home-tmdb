"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookmarkCheckIcon, BookmarkPlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

export interface WatchlistMovie {
  movieId: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
}

/** Saved ids, shared by every button on the page via one cached query. */
function useWatchlistToggle(movie: WatchlistMovie) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const idsKey = trpc.watchlist.ids.queryKey();

  const { data: ids, isPending } = useQuery(trpc.watchlist.ids.queryOptions());
  const saved = ids?.includes(movie.movieId) ?? false;

  const optimistic = (update: (ids: number[]) => number[]) => ({
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: idsKey });
      const previous = queryClient.getQueryData<number[]>(idsKey);
      queryClient.setQueryData<number[]>(idsKey, (old) => update(old ?? []));
      return { previous };
    },
    onError: (_error: unknown, _variables: unknown, result: { previous?: number[] } | undefined) => {
      queryClient.setQueryData(idsKey, result?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: trpc.watchlist.pathKey() }),
  });

  const add = useMutation(
    trpc.watchlist.add.mutationOptions(
      optimistic((old) => (old.includes(movie.movieId) ? old : [...old, movie.movieId])),
    ),
  );
  const remove = useMutation(
    trpc.watchlist.remove.mutationOptions(optimistic((old) => old.filter((id) => id !== movie.movieId))),
  );

  const toggle = () => (saved ? remove.mutate({ movieId: movie.movieId }) : add.mutate(movie));

  return { saved, toggle, isLoading: isPending };
}

export function WatchlistButton({
  movie,
  variant = "full",
  className,
}: {
  movie: WatchlistMovie;
  variant?: "full" | "icon";
  className?: string;
}) {
  const { saved, toggle, isLoading } = useWatchlistToggle(movie);
  const label = saved ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`;
  const Icon = saved ? BookmarkCheckIcon : BookmarkPlusIcon;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={isLoading}
        aria-label={label}
        aria-pressed={saved}
        title={saved ? "On your watchlist" : "Add to watchlist"}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:scale-110 hover:bg-black/80 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-0",
          saved && "bg-primary text-primary-foreground hover:bg-primary/90",
          className,
        )}
      >
        <Icon className="size-4" />
      </button>
    );
  }

  return (
    <Button
      type="button"
      onClick={toggle}
      disabled={isLoading}
      aria-pressed={saved}
      aria-label={label}
      variant={saved ? "secondary" : "default"}
      className={className}
    >
      <Icon />
      {saved ? "On watchlist" : "Add to watchlist"}
    </Button>
  );
}
