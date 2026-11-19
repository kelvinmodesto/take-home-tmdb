"use client";

import { PlayIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function TrailerDialog({ videoKey, title }: { videoKey: string; title: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlayIcon /> Play trailer
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden border-0 bg-black p-0 sm:max-w-5xl">
        <DialogTitle className="px-4 py-3 pr-12 text-sm font-medium">{title}</DialogTitle>
        <DialogDescription className="sr-only">Trailer video from YouTube</DialogDescription>
        {/* Content unmounts on close, which also stops playback. */}
        <div className="aspect-video w-full">
          <iframe
            className="size-full"
            src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
