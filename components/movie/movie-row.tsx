import { cn } from "@/lib/utils";

import { MovieCard, MovieCardSkeleton, type MovieCardData } from "./movie-card";

const ITEM_CLASS = "w-36 shrink-0 snap-start sm:w-40 lg:w-44";

export function MovieRow({
  title,
  description,
  movies,
  className,
}: {
  title: string;
  description?: string;
  movies: MovieCardData[];
  className?: string;
}) {
  if (movies.length === 0) return null;

  return (
    <section className={cn("space-y-4", className)} aria-label={title}>
      <SectionHeading title={title} description={description} />
      <div className="relative -mx-4 sm:-mx-6">
        <ul className="scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:scroll-px-6 sm:px-6">
          {movies.map((movie) => (
            <li key={movie.id} className={ITEM_CLASS}>
              <MovieCard movie={movie} sizes="176px" />
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}

export function MovieRowSkeleton({ title }: { title: string }) {
  return (
    <section className="space-y-4" aria-busy>
      <SectionHeading title={title} />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }, (_, i) => (
          <MovieCardSkeleton key={i} className={ITEM_CLASS} />
        ))}
      </div>
    </section>
  );
}

export function SectionHeading({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-2">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
