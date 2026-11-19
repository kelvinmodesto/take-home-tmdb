import { FilmIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-28 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-muted">
        <FilmIcon className="size-6 text-muted-foreground" />
      </span>
      <h1 className="text-2xl font-bold">This reel is missing</h1>
      <p className="text-muted-foreground">
        We couldn&apos;t find that page or movie. It may have been removed from TMDB.
      </p>
      <Button asChild>
        <Link href="/">Back to discover</Link>
      </Button>
    </div>
  );
}
