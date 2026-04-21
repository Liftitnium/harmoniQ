"use client";

import React from "react";
import { songsterrPlayerUrl } from "@/lib/songsterr";

export function SongsterrPlayer({
  songId,
  onClose,
}: {
  songId: number;
  onClose: () => void;
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-700">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
          Songsterr Tab Player
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-extrabold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Close
        </button>
      </div>
      <iframe
        src={songsterrPlayerUrl(songId)}
        width="100%"
        height="480"
        frameBorder="0"
        allowFullScreen
        className="block"
        title="Songsterr tab player"
      />
    </div>
  );
}
