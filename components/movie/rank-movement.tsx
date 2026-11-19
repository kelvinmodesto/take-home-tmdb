import { ArrowDownIcon, ArrowUpIcon, FlameIcon, MinusIcon, SparklesIcon } from "lucide-react";

import type { RankMovement as RankMovementData } from "@/lib/trending-history";
import { cn } from "@/lib/utils";

/**
 * Shows how a movie's rank changed since the previous daily snapshot.
 * Renders nothing until there is history to compare against.
 */
export function RankMovement({
  rank,
  movement,
  hasBaseline,
  className,
}: {
  rank: number;
  movement: RankMovementData | undefined;
  hasBaseline: boolean;
  className?: string;
}) {
  if (!hasBaseline) return null;

  const previous = movement?.previousRank ?? null;
  const streak = movement?.streak ?? 0;
  const base =
    "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums";

  let indicator: React.ReactNode;
  if (previous === null) {
    indicator = (
      <span className={cn(base, "bg-info/15 text-info")} title="New on the trending list today">
        <SparklesIcon className="size-3" /> NEW
      </span>
    );
  } else if (previous > rank) {
    indicator = (
      <span className={cn(base, "bg-primary/15 text-primary")} title={`Up from #${previous}`}>
        <ArrowUpIcon className="size-3" />
        {previous - rank}
      </span>
    );
  } else if (previous < rank) {
    indicator = (
      <span
        className={cn(base, "bg-destructive/15 text-destructive")}
        title={`Down from #${previous}`}
      >
        <ArrowDownIcon className="size-3" />
        {rank - previous}
      </span>
    );
  } else {
    indicator = (
      <span className={cn(base, "bg-muted text-muted-foreground")} title="Same rank as yesterday">
        <MinusIcon className="size-3" />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {indicator}
      {streak >= 3 && (
        <span
          className={cn(base, "bg-highlight/15 text-highlight")}
          title={`Trending ${streak} days in a row`}
        >
          <FlameIcon className="size-3" />
          {streak}d
        </span>
      )}
    </span>
  );
}
