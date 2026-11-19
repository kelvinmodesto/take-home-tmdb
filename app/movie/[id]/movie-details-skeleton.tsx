import { MovieRowSkeleton } from "@/components/movie/movie-row";
import { Skeleton } from "@/components/ui/skeleton";

export function MovieDetailsSkeleton() {
  return (
    <div aria-busy aria-label="Loading movie">
      <div className="border-b">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[260px_1fr] md:py-14 lg:grid-cols-[300px_1fr]">
          <Skeleton className="mx-auto aspect-[2/3] w-52 rounded-xl md:w-full" />
          <div className="space-y-5 self-center">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <div className="flex gap-3">
              <Skeleton className="size-14 rounded-full" />
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-32" />
            </div>
            <Skeleton className="h-24 w-full max-w-3xl" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <MovieRowSkeleton title="Top billed cast" />
      </div>
    </div>
  );
}
