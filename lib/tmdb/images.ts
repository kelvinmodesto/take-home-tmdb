/**
 * TMDB serves pre-sized renditions, so instead of re-optimizing through
 * Next's image optimizer we map the requested width to the closest TMDB size.
 * See https://developer.themoviedb.org/docs/image-basics
 */
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const SIZES = {
  poster: [92, 154, 185, 342, 500, 780],
  backdrop: [300, 780, 1280],
  profile: [45, 185],
  logo: [45, 92, 154, 185, 300, 500],
} as const;

export type TmdbImageKind = keyof typeof SIZES;

export function tmdbImageUrl(path: string, kind: TmdbImageKind, width: number) {
  const size = SIZES[kind].find((w) => w >= width);
  return `${IMAGE_BASE_URL}/${size ? `w${size}` : "original"}${path}`;
}
