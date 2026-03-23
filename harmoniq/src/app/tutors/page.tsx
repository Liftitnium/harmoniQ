"use client";

import React, { useMemo, useState } from "react";
import { Search, Star, Users, CalendarDays } from "lucide-react";
import { TUTORS, type Tutor } from "@/lib/data";
import { Modal } from "@/components/harmoniq/Modal";
import { useToast } from "@/components/harmoniq/toast/ToastProvider";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);

  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${rating}`}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const active = idx < filled;
        return (
          <Star
            key={idx}
            className={cx(
              "h-4 w-4 transition",
              active ? "text-teal-700" : "text-slate-300"
            )}
            fill={active ? "currentColor" : "none"}
          />
        );
      })}
      <span className="ml-1 text-xs font-extrabold text-slate-700">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function TutorsPage() {
  const { addToast } = useToast();

  const [query, setQuery] = useState("");
  const [instrument, setInstrument] = useState<string>("All");

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [dateTime, setDateTime] = useState("");

  const instruments = useMemo(() => {
    const all = new Set<string>();
    for (const t of TUTORS) {
      for (const i of t.instruments) all.add(i);
    }
    return ["All", ...Array.from(all)];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return TUTORS.filter((t) => {
      const matchesQuery =
        q.length === 0 ||
        t.name.toLowerCase().includes(q) ||
        t.bio.toLowerCase().includes(q) ||
        t.instruments.some((i) => i.toLowerCase().includes(q));
      const matchesInstrument =
        instrument === "All" || t.instruments.includes(instrument);
      return matchesQuery && matchesInstrument;
    });
  }, [query, instrument]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Tutor Discovery & Booking
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Find the right teacher for your next step.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <Users className="h-5 w-5 text-teal-700" />
          <p className="text-sm font-extrabold text-slate-800">
            {filtered.length} tutors
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tutors, instruments, or skills..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-200 focus:ring-2 focus:ring-teal-50"
            />
          </div>

          <select
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-200 focus:ring-2 focus:ring-teal-50 md:w-52"
          >
            {instruments.map((i) => (
              <option key={i} value={i}>
                {i === "All" ? "All instruments" : i}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => {
          const isAvailable = t.availability === "Available";
          return (
            <article
              key={t.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black text-slate-900">
                    {t.name}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {t.instruments.slice(0, 3).map((i) => (
                      <span
                        key={i}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700"
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className={cx(
                    "rounded-full border px-3 py-1 text-xs font-extrabold",
                    isAvailable
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  )}
                >
                  {t.availability}
                </div>
              </div>

              <div className="mt-3">
                <Stars rating={t.rating} />
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  {t.bio}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Price
                  </p>
                  <p className="text-xl font-black text-slate-900">
                    ${t.pricePerHour}
                    <span className="text-sm font-extrabold text-slate-600">
                      /hr
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTutor(t);
                    setDateTime("");
                    setBookingOpen(true);
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-teal-700 px-4 text-sm font-extrabold text-white transition hover:bg-teal-800"
                >
                  Book Session
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <Modal
        open={bookingOpen}
        title={selectedTutor ? `Book with ${selectedTutor.name}` : "Book Session"}
        onClose={() => setBookingOpen(false)}
      >
        {selectedTutor ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {selectedTutor.availability} • ${selectedTutor.pricePerHour}/hr
                  </p>
                  <p className="mt-2 text-base font-extrabold text-slate-900">
                    Pick a date & time
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    UI-only picker (no real booking).
                  </p>
                </div>
                <CalendarDays className="h-5 w-5 text-teal-700" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800">
                Date & time
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-200 focus:ring-2 focus:ring-teal-50"
              />
              <p className="text-xs font-semibold text-slate-500">
                Tip: any date works for this prototype.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setBookingOpen(false)}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-extrabold text-slate-800 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setBookingOpen(false);
                  const when = dateTime ? ` • ${dateTime}` : "";
                  addToast({
                    kind: "success",
                    title: "Booking confirmed",
                    message: `${selectedTutor.name}${when}`,
                  });
                }}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-teal-700 text-sm font-extrabold text-white transition hover:bg-teal-800"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

