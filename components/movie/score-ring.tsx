import { cn, scorePercent } from "@/lib/utils";

/** TMDB-style circular "user score". */
export function ScoreRing({
  voteAverage,
  voteCount,
  size = 40,
  className,
}: {
  voteAverage: number | null | undefined;
  voteCount?: number;
  size?: number;
  className?: string;
}) {
  const rated = voteAverage != null && voteAverage > 0 && voteCount !== 0;
  const percent = rated ? scorePercent(voteAverage) : 0;
  const stroke = Math.max(2.5, size / 14);
  const radius = (size - stroke) / 2 - 1.5;
  const circumference = 2 * Math.PI * radius;
  const color = !rated
    ? "text-muted-foreground"
    : percent >= 70
      ? "text-primary"
      : percent >= 40
        ? "text-yellow-400"
        : "text-destructive";

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-[#081c22]",
        className,
      )}
      style={{ width: size, height: size }}
      title={rated ? `User score: ${percent}%` : "Not rated yet"}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={cn("stroke-current opacity-25", color)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          className={cn("stroke-current", color)}
        />
      </svg>
      <span
        className="relative font-bold tabular-nums text-white"
        style={{ fontSize: Math.max(10, size * 0.3) }}
      >
        {rated ? (
          <>
            {percent}
            <sup className="text-[0.5em]">%</sup>
          </>
        ) : (
          "NR"
        )}
      </span>
    </div>
  );
}
