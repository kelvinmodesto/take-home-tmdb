import type { Metadata } from "next";

import { WatchlistView } from "./watchlist-view";

export const metadata: Metadata = { title: "Your watchlist" };

export default function WatchlistPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your watchlist</h1>
        <p className="text-muted-foreground">Movies you&apos;ve saved for later, stored on this device.</p>
      </div>
      <WatchlistView />
    </div>
  );
}
