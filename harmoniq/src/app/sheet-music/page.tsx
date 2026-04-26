"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ExternalLink,
  Heart,
  Loader2,
  Music2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  searchSongs,
  getSongsterrEmbedUrl,
  getSongsterrSearchUrl,
  type SongsterrResult,
} from "@/lib/songsterr";
import { SongsterrPlayer } from "@/components/harmoniq/roadmap/SongsterrPlayer";

/* ------------------------------------------------------------------ */
/*  Favorites — localStorage persistence                               */
/* ------------------------------------------------------------------ */

interface FavoriteSong {
  songsterrId: number;
  title: string;
  artist: string;
}

const FAV_KEY = "harmoniq:favorites";

function loadFavorites(): FavoriteSong[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: FavoriteSong[]) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/*  Discover seeds                                                     */
/* ------------------------------------------------------------------ */

const DISCOVER_QUERIES = [
  "Wonderwall Oasis",
  "Nothing Else Matters Metallica",
  "Wish You Were Here Pink Floyd",
  "Hotel California Eagles",
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type ViewTab = "search" | "library";

export default function SheetMusicPage() {
  /* ---- state ---- */
  const [tab, setTab] = useState<ViewTab>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SongsterrResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteSong[]>([]);
  const [favsLoaded, setFavsLoaded] = useState(false);

  const [discoverResults, setDiscoverResults] = useState<SongsterrResult[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);

  const [activeSong, setActiveSong] = useState<{
    id: number;
    title: string;
    artist: string;
  } | null>(null);

  const playerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- load favorites from localStorage ---- */
  useEffect(() => {
    setFavorites(loadFavorites());
    setFavsLoaded(true);
  }, []);

  useEffect(() => {
    if (favsLoaded) saveFavorites(favorites);
  }, [favorites, favsLoaded]);

  const favIdSet = useMemo(
    () => new Set(favorites.map((f) => f.songsterrId)),
    [favorites],
  );

  /* ---- discover: run seed searches once ---- */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setDiscoverLoading(true);
      const all = await Promise.all(DISCOVER_QUERIES.map(searchSongs));
      if (cancelled) return;

      const seen = new Set<number>();
      const merged: SongsterrResult[] = [];
      for (const batch of all) {
        for (const song of batch.slice(0, 4)) {
          if (!seen.has(song.id)) {
            seen.add(song.id);
            merged.push(song);
          }
        }
      }
      setDiscoverResults(merged);
      setDiscoverLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- search with debounce ---- */
  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      setSearchError(false);
      return;
    }
    setSearching(true);
    setSearchError(false);
    setHasSearched(true);
    try {
      const data = await searchSongs(q);
      setResults(data);
    } catch {
      setSearchError(true);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  /* ---- helpers ---- */
  function toggleFavorite(song: SongsterrResult) {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.songsterrId === song.id);
      if (exists) return prev.filter((f) => f.songsterrId !== song.id);
      return [
        ...prev,
        { songsterrId: song.id, title: song.title, artist: song.artist.name },
      ];
    });
  }

  function toggleFavoriteDirect(fav: FavoriteSong) {
    setFavorites((prev) =>
      prev.filter((f) => f.songsterrId !== fav.songsterrId),
    );
  }

  function openPlayer(song: { id: number; title: string; artist: string }) {
    setActiveSong(song);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  /* ---- cards for search results / discover ---- */
  function SongCard({ song }: { song: SongsterrResult }) {
    const isFav = favIdSet.has(song.id);
    const isActive = activeSong?.id === song.id;
    return (
      <article
        className={`group relative cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition hover:scale-[1.02] hover:shadow-md dark:bg-slate-800 ${
          isActive
            ? "border-teal-400 ring-2 ring-teal-200 dark:border-teal-600 dark:ring-teal-900"
            : "border-slate-200 dark:border-slate-700"
        }`}
        onClick={() =>
          openPlayer({ id: song.id, title: song.title, artist: song.artist.name })
        }
      >
        {/* favorite toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song);
          }}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`h-4 w-4 transition ${
              isFav
                ? "fill-red-500 text-red-500 scale-110"
                : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500"
            }`}
          />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/40">
            <Music2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <p className="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">
              {song.title}
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
              {song.artist.name}
            </p>
          </div>
        </div>

        {song.chordsPresent && (
          <span className="mt-2.5 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
            Chords available
          </span>
        )}
      </article>
    );
  }

  function FavCard({ fav }: { fav: FavoriteSong }) {
    const isActive = activeSong?.id === fav.songsterrId;
    return (
      <article
        className={`group relative cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition hover:scale-[1.02] hover:shadow-md dark:bg-slate-800 ${
          isActive
            ? "border-teal-400 ring-2 ring-teal-200 dark:border-teal-600 dark:ring-teal-900"
            : "border-slate-200 dark:border-slate-700"
        }`}
        onClick={() =>
          openPlayer({ id: fav.songsterrId, title: fav.title, artist: fav.artist })
        }
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteDirect(fav);
          }}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Remove from favorites"
        >
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/40">
            <Music2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <p className="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">
              {fav.title}
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
              {fav.artist}
            </p>
          </div>
        </div>
      </article>
    );
  }

  /* ---- skeleton cards ---- */
  function SkeletonCard() {
    return (
      <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 w-3/4 rounded bg-slate-100 dark:bg-slate-700" />
            <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  /* ---- which grid to show ---- */
  const showSearchResults = tab === "search" && hasSearched;
  const showDiscover = tab === "search" && !hasSearched;
  const showLibrary = tab === "library";

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Sheet Music
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Search and play guitar tabs from Songsterr
        </p>
      </div>

      {/* ---- Tabs ---- */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("search")}
          className={`rounded-2xl border px-4 py-2.5 text-sm font-extrabold transition ${
            tab === "search"
              ? "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-100"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            Search
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("library")}
          className={`rounded-2xl border px-4 py-2.5 text-sm font-extrabold transition ${
            tab === "library"
              ? "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-100"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <Heart className="h-3.5 w-3.5" />
            My Library
            {favorites.length > 0 && (
              <span className="rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* ---- Search bar ---- */}
      {tab === "search" && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for any song or artist..."
            className="h-13 w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-600 dark:focus:ring-teal-900"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {searching && (
            <Loader2 className="absolute right-12 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-teal-500" />
          )}
        </div>
      )}

      {/* ---- Search Results ---- */}
      {showSearchResults && (
        <section>
          {searching ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : searchError ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Something went wrong. Try again?
              </p>
              <button
                type="button"
                onClick={() => runSearch(query)}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No results for &quot;{query}&quot;. Try a different search or
                browse on Songsterr.
              </p>
              <a
                href={getSongsterrSearchUrl(query)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
              >
                Search on Songsterr
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---- Discover (default state) ---- */}
      {showDiscover && (
        <>
          {/* Saved songs */}
          {favorites.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Your saved songs
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {favorites.map((fav) => (
                  <FavCard key={fav.songsterrId} fav={fav} />
                ))}
              </div>
            </section>
          )}

          {/* Popular songs */}
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Popular songs to get started
            </h2>
            {discoverLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : discoverResults.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {discoverResults.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Couldn&apos;t load suggestions. Try searching above.
              </p>
            )}
          </section>
        </>
      )}

      {/* ---- My Library tab ---- */}
      {showLibrary && (
        <section>
          {favorites.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <Heart className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                You haven&apos;t saved any songs yet. Search for songs and tap
                ♡ to save them here.
              </p>
              <button
                type="button"
                onClick={() => setTab("search")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700"
              >
                <Search className="h-4 w-4" />
                Search songs
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favorites.map((fav) => (
                <FavCard key={fav.songsterrId} fav={fav} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---- Player ---- */}
      {activeSong && (
        <div ref={playerRef} className="scroll-mt-4">
          <SongsterrPlayer
            songId={activeSong.id}
            title={activeSong.title}
            artist={activeSong.artist}
            onClose={() => setActiveSong(null)}
          />
        </div>
      )}
    </div>
  );
}
