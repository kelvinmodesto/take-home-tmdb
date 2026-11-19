"use client";

import { FilmIcon, UserIcon } from "lucide-react";
import Image, { type ImageProps } from "next/image";

import { tmdbImageUrl, type TmdbImageKind } from "@/lib/tmdb/images";
import { cn } from "@/lib/utils";

type TmdbImageProps = Omit<ImageProps, "src" | "loader" | "alt"> & {
  path: string | null | undefined;
  kind: TmdbImageKind;
  alt: string;
};

/**
 * `next/image` with a loader that picks the closest pre-sized TMDB rendition,
 * so we get responsive `srcset`s without proxying images through our server.
 * Renders a placeholder when TMDB has no image.
 */
export function TmdbImage({ path, kind, alt, className, ...props }: TmdbImageProps) {
  if (!path) {
    const Icon = kind === "profile" ? UserIcon : FilmIcon;
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          props.fill && "absolute inset-0",
          className,
        )}
      >
        <Icon className="size-1/4 max-w-12 opacity-50" />
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      src={path}
      loader={({ width }) => tmdbImageUrl(path, kind, width)}
      className={className}
    />
  );
}
