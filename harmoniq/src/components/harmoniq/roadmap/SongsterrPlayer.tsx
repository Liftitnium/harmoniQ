"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { getSongsterrEmbedUrl, getSongsterrSearchUrl } from "@/lib/songsterr";

const IFRAME_TIMEOUT_MS = 10_000;

interface SongsterrPlayerProps {
  songId: number;
  title?: string;
  artist?: string;
  onClose?: () => void;
}

export function SongsterrPlayer({
  songId,
  title,
  artist,
  onClose,
}: SongsterrPlayerProps) {
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const timer = setTimeout(() => setTimedOut(true), IFRAME_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [loaded]);

  const handleLoad = useCallback(() => setLoaded(true), []);

  const fallbackQuery = [title, artist].filter(Boolean).join(" ");
  const songsterrUrl = getSongsterrEmbedUrl(songId);

  if (timedOut && !loaded) {
    return (
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          The tab player didn&apos;t load in time.
        </p>
        <a
          href={getSongsterrSearchUrl(fallbackQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700"
        >
          Open on Songsterr
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-700">
        <div className="min-w-0">
          {title && (
            <p className="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">
              {title}
            </p>
          )}
          {artist && (
            <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
              {artist}
            </p>
          )}
          {!title && !artist && (
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Songsterr Tab Player
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-extrabold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Close
          </button>
        )}
      </div>

      {/* Iframe */}
      <iframe
        src={songsterrUrl}
        width="100%"
        height="600"
        frameBorder="0"
        allowFullScreen
        onLoad={handleLoad}
        className="block rounded-lg border-0"
        title={`Songsterr tab: ${title ?? "player"}`}
      />

      {/* Footer */}
      <div className="border-t border-slate-200 px-4 py-2 dark:border-slate-700">
        <a
          href={songsterrUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 transition hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
        >
          Open in Songsterr
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
