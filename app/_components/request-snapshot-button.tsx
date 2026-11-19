"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckIcon, LoaderCircleIcon, PlayIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";

export function RequestSnapshotButton() {
  const trpc = useTRPC();
  const snapshot = useMutation(trpc.trending.requestSnapshot.mutationOptions());

  if (snapshot.isSuccess) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-primary">
        <CheckIcon className="size-4" /> Snapshot queued. Refresh in a few seconds.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => snapshot.mutate()}
        disabled={snapshot.isPending}
      >
        {snapshot.isPending ? <LoaderCircleIcon className="animate-spin" /> : <PlayIcon />}
        Take first snapshot
      </Button>
      {snapshot.isError && <p className="text-xs text-destructive">{snapshot.error.message}</p>}
    </div>
  );
}
