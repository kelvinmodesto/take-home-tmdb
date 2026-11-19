import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function releaseYear(date: string | null | undefined) {
  return date ? date.slice(0, 4) : null;
}

export function formatRuntime(minutes: number | null | undefined) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function formatDate(date: string | null | undefined) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function formatMoney(amount: number | null | undefined) {
  if (!amount) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

const languageNames = new Intl.DisplayNames(["en"], { type: "language" });

export function languageName(code: string) {
  try {
    return languageNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** TMDB scores are 0-10; we display them as a percentage like tmdb.org does. */
export function scorePercent(voteAverage: number) {
  return Math.round(voteAverage * 10);
}

/** Accepts `550` as well as slugged ids like `550-fight-club`. */
export function parseMovieId(raw: string) {
  const match = /^(\d+)(?:-|$)/.exec(raw);
  const id = match ? Number(match[1]) : NaN;
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function utcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
