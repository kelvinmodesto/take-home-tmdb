"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-28 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/15">
        <TriangleAlertIcon className="size-6 text-destructive" />
      </span>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">
        We couldn&apos;t load this from TMDB. It might be a temporary hiccup.
      </p>
      <Button onClick={() => retry()}>Try again</Button>
    </div>
  );
}
