"use client";

import React, { useEffect, useState } from "react";
import { ExternalLink, Loader2, SearchX } from "lucide-react";
import {
  searchSongByTitleAndArtist,
  getSongsterrSearchUrl,
  type SongsterrResult,
} from "@/lib/songsterr";
import { SongsterrPlayer } from "./SongsterrPlayer";

// Module-level session cache so we never re-search the same song
const resultCache = new Map<string, SongsterrResult | null>();

interface SongsterrSearchProps {
  title: string;
  artist: string;
  onClose?: () => void;
}

export function SongsterrSearch({
  title,
  artist,
  onClose,
}: SongsterrSearchProps) {
  const [state, setState] = useState<"loading" | "found" | "not_found">(
    "loading",
  );
  const [result, setResult] = useState<SongsterrResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `${title}||${artist}`;

    if (resultCache.has(cacheKey)) {
      const cached = resultCache.get(cacheKey)!;
      setResult(cached);
      setState(cached ? "found" : "not_found");
      return;
    }

    setState("loading");
    searchSongByTitleAndArtist(title, artist).then((res) => {
      if (cancelled) return;
      resultCache.set(cacheKey, res);
      setResult(res);
      setState(res ? "found" : "not_found");
    });

    return () => {
      cancelled = true;
    };
  }, [title, artist]);

  if (state === "loading") {
    return (
      <div className="mt-3 flex h-[600px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Finding tab for &ldquo;{title}&rdquo;…
          </p>
        </div>
      </div>
    );
  }

  if (state === "found" && result) {
    return (
      <SongsterrPlayer
        songId={result.id}
        title={result.title}
        artist={result.artist.name}
        onClose={onClose}
      />
    );
  }

  // Not found
  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
      <SearchX className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
      <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
        We couldn&apos;t find an exact match for &ldquo;{title}&rdquo; by{" "}
        {artist}
      </p>
      <a
        href={getSongsterrSearchUrl(`${title} ${artist}`)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700"
      >
        Search on Songsterr
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-2 block w-full text-xs font-bold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Close
        </button>
      )}
    </div>
  );
}
