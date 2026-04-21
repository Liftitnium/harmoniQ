"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Heart,
  Search,
  Sparkles,
  Music2,
  LockKeyhole,
} from "lucide-react";
import { SHEET_MUSIC, type SheetDifficulty, type SheetMusic } from "@/lib/data";
import { Modal } from "@/components/harmoniq/Modal";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function DifficultyBadge({ difficulty }: { difficulty: SheetDifficulty }) {
  const tone =
    difficulty === "Beginner"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : difficulty === "Intermediate"
        ? "bg-teal-50 border-teal-200 text-teal-800"
        : "bg-indigo-50 border-indigo-200 text-indigo-800";

  return (
    <span className={cx("rounded-full border px-3 py-1 text-xs font-extrabold", tone)}>
      {difficulty}
    </span>
  );
}

function StaffPreview({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-slate-900">
            {title}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-600">
            Fake preview (prototype)
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100">
          <Music2 className="h-5 w-5 text-teal-700" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <svg
          viewBox="0 0 320 420"
          className="h-[220px] w-full rounded-xl border border-slate-200 bg-slate-50"
          aria-label="Sheet music preview page 1"
        >
          <rect x="0" y="0" width="320" height="420" fill="rgb(248 250 252)" />
          <g stroke="rgba(15,23,42,0.25)" strokeWidth="2">
            <line x1="40" y1="110" x2="280" y2="110" />
            <line x1="40" y1="130" x2="280" y2="130" />
            <line x1="40" y1="150" x2="280" y2="150" />
            <line x1="40" y1="170" x2="280" y2="170" />
            <line x1="40" y1="190" x2="280" y2="190" />
          </g>
          <g fill="rgba(15,23,42,0.65)">
            <circle cx="95" cy="150" r="6" />
            <circle cx="130" cy="130" r="6" />
            <circle cx="165" cy="170" r="6" />
            <circle cx="205" cy="150" r="6" />
            <circle cx="245" cy="130" r="6" />
          </g>
          <g stroke="rgba(15,23,42,0.35)" strokeWidth="2" fill="none">
            <path d="M60 95 C120 85, 170 95, 250 80" />
          </g>
          <text x="40" y="55" fontSize="12" fontWeight="800" fill="rgba(15,23,42,0.8)">
            Page 1
          </text>
        </svg>

        <svg
          viewBox="0 0 320 420"
          className="h-[220px] w-full rounded-xl border border-slate-200 bg-slate-50"
          aria-label="Sheet music preview page 2"
        >
          <rect x="0" y="0" width="320" height="420" fill="rgb(248 250 252)" />
          <g stroke="rgba(15,23,42,0.25)" strokeWidth="2">
            <line x1="40" y1="130" x2="280" y2="130" />
            <line x1="40" y1="150" x2="280" y2="150" />
            <line x1="40" y1="170" x2="280" y2="170" />
            <line x1="40" y1="190" x2="280" y2="190" />
            <line x1="40" y1="210" x2="280" y2="210" />
          </g>
          <g fill="rgba(15,23,42,0.65)">
            <circle cx="85" cy="170" r="6" />
            <circle cx="120" cy="190" r="6" />
            <circle cx="155" cy="150" r="6" />
            <circle cx="195" cy="170" r="6" />
            <circle cx="235" cy="190" r="6" />
          </g>
          <g stroke="rgba(15,23,42,0.35)" strokeWidth="2" fill="none">
            <path d="M80 225 C130 215, 185 230, 260 210" />
          </g>
          <text x="40" y="85" fontSize="12" fontWeight="800" fill="rgba(15,23,42,0.8)">
            Page 2
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function SheetMusicPage() {
  const [query, setQuery] = useState("");
  const [instrument, setInstrument] = useState<string>("All");
  const [difficulty, setDifficulty] = useState<SheetDifficulty | "All">("All");

  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<SheetMusic | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("harmoniq:favorites");
      if (!raw) return;
      const ids: string[] = JSON.parse(raw);
      setFavorites(new Set(ids));
    } catch {
      // Ignore localStorage errors in prototype mode.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "harmoniq:favorites",
        JSON.stringify(Array.from(favorites))
      );
    } catch {
      // Ignore
    }
  }, [favorites]);

  const instruments = useMemo(() => {
    const all = new Set<string>();
    for (const s of SHEET_MUSIC) all.add(s.instrument);
    return ["All", ...Array.from(all)];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SHEET_MUSIC.filter((s) => {
      const matchesQuery =
        q.length === 0 ||
        s.title.toLowerCase().includes(q) ||
        s.composer.toLowerCase().includes(q) ||
        s.instrument.toLowerCase().includes(q);
      const matchesInstrument = instrument === "All" || s.instrument === instrument;
      const matchesDifficulty = difficulty === "All" || s.difficulty === difficulty;
      return matchesQuery && matchesInstrument && matchesDifficulty;
    });
  }, [query, instrument, difficulty]);

  const favoriteCount = favorites.size;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Sheet Music Library
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Extra pieces for self-directed practice outside your roadmap.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <Heart className="h-5 w-5 text-teal-700" />
          <p className="text-sm font-extrabold text-slate-800">
            {favoriteCount} favorite{favoriteCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div className="relative md:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles or composers..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-200 focus:ring-2 focus:ring-teal-50"
            />
          </div>

          <select
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-200 focus:ring-2 focus:ring-teal-50"
          >
            {instruments.map((i) => (
              <option key={i} value={i}>
                {i === "All" ? "All instruments" : i}
              </option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as SheetDifficulty | "All")}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-200 focus:ring-2 focus:ring-teal-50"
          >
            <option value="All">All difficulty</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s) => {
          const isFav = favorites.has(s.id);
          return (
            <article
              key={s.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black text-slate-900">
                    {s.title}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    {s.composer}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFavorites((prev) => {
                      const next = new Set(prev);
                      if (next.has(s.id)) next.delete(s.id);
                      else next.add(s.id);
                      return next;
                    });
                  }}
                  className={cx(
                    "rounded-2xl border px-3 py-2 transition",
                    isFav
                      ? "border-teal-200 bg-teal-50 text-teal-800"
                      : "border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                  )}
                  aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    className="h-5 w-5"
                    fill={isFav ? "currentColor" : "none"}
                    strokeWidth={2}
                  />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={s.difficulty} />
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-700">
                  {s.instrument}
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Preview
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      Fake pages • Quick view
                    </p>
                  </div>
                  <Sparkles className="h-5 w-5 text-teal-700" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <BookOpen className="h-4 w-4 text-teal-700" />
                    Ready
                  </div>
                  {isFav ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-extrabold text-teal-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                      Saved
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-extrabold text-slate-600">
                      <LockKeyhole className="h-4 w-4 text-slate-400" />
                      Not saved
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelected(s);
                    setViewOpen(true);
                  }}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 text-sm font-extrabold text-white transition hover:bg-teal-800"
                >
                  View
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <Modal
        open={viewOpen}
        title={selected ? selected.title : "Sheet Music"}
        onClose={() => setViewOpen(false)}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {selected.instrument} • {selected.difficulty}
                </p>
                <p className="mt-2 text-base font-extrabold text-slate-900">
                  {selected.title}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Composer: {selected.composer}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFavorites((prev) => {
                    const next = new Set(prev);
                    if (next.has(selected.id)) next.delete(selected.id);
                    else next.add(selected.id);
                    return next;
                  });
                }}
                className={cx(
                  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-extrabold transition",
                  favorites.has(selected.id)
                    ? "border-teal-200 bg-teal-50 text-teal-800"
                    : "border-slate-200 bg-white text-slate-800 hover:border-teal-200 hover:bg-teal-50"
                )}
              >
                <Heart
                  className="h-4 w-4"
                  fill={favorites.has(selected.id) ? "currentColor" : "none"}
                />
                {favorites.has(selected.id) ? "Favorited" : "Add to favorites"}
              </button>
            </div>

            <StaffPreview title={selected.title} />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

