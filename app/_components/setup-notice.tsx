import { KeyRoundIcon } from "lucide-react";

export function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 sm:px-6">
      <div className="space-y-4 rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-highlight/15 text-highlight">
            <KeyRoundIcon className="size-5" />
          </span>
          <h1 className="text-xl font-semibold">Connect your TMDB account</h1>
        </div>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Create a free account and copy the <strong>API Read Access Token</strong> from{" "}
            <a
              className="text-info hover:underline"
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noreferrer"
            >
              themoviedb.org/settings/api
            </a>
            .
          </li>
          <li>
            Add it to <code className="rounded bg-muted px-1 py-0.5">.env</code> as{" "}
            <code className="rounded bg-muted px-1 py-0.5">TMDB_API_READ_ACCESS_TOKEN</code>.
          </li>
          <li>Restart the dev server.</li>
        </ol>
      </div>
    </div>
  );
}
