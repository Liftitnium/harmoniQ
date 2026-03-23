import React from "react";
import {
  CheckCircle2,
  Lock,
  CalendarDays,
  Clock,
  TrendingUp,
} from "lucide-react";
import { PROGRESS_DASHBOARD } from "@/lib/data";

function ProgressBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-slate-900">{label}</p>
        <p className="text-sm font-extrabold text-teal-800">{value}%</p>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-2 rounded-full bg-teal-600"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function RadarChart({
  data,
}: {
  data: ReadonlyArray<{ label: string; value: number }>;
}) {
  const size = 320;
  const cx = 160;
  const cy = 160;
  const radius = 105;
  const levels = 4;

  const count = data.length;
  const axisAngleOffset = -Math.PI / 2;

  const angleForIndex = (i: number) => {
    return axisAngleOffset + (i * 2 * Math.PI) / count;
  };

  const outerPoints = Array.from({ length: count }).map((_, i) => {
    const a = angleForIndex(i);
    return {
      x: cx + radius * Math.cos(a),
      y: cy + radius * Math.sin(a),
    };
  });

  const outerPolygon = outerPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const polygonPoints = data
    .map((d, i) => {
      const a = angleForIndex(i);
      const r = (d.value / 100) * radius;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        Skill radar
      </p>
      <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-[280px] w-full max-w-[340px]">
          {/* grid */}
          {Array.from({ length: levels }).map((_, levelIdx) => {
            const t = (levelIdx + 1) / levels;
            const points = outerPoints
              .map((p, i) => {
                const a = angleForIndex(i);
                const r = t * radius;
                const x = cx + r * Math.cos(a);
                const y = cy + r * Math.sin(a);
                return `${x},${y}`;
              })
              .join(" ");

            return (
              <polygon
                key={levelIdx}
                points={points}
                fill="none"
                stroke="rgba(15,23,42,0.12)"
                strokeWidth="1"
              />
            );
          })}

          {/* axes */}
          {Array.from({ length: count }).map((_, i) => {
            const a = angleForIndex(i);
            const x = cx + radius * Math.cos(a);
            const y = cy + radius * Math.sin(a);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="rgba(15,23,42,0.12)"
                strokeWidth="1"
              />
            );
          })}

          {/* outer */}
          <polygon points={outerPolygon} fill="none" stroke="rgba(15,23,42,0.18)" strokeWidth="2" />

          {/* data */}
          <polygon points={polygonPoints} fill="rgba(13,148,136,0.18)" stroke="#0f766e" strokeWidth="2" />
        </svg>

        <div className="w-full sm:w-56 space-y-3">
          {data.map((d) => (
            <div key={d.label} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-slate-900">
                  {d.label}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  Target: 100%
                </p>
              </div>
              <p className="text-sm font-extrabold text-teal-800">{d.value}%</p>
            </div>
          ))}
          <p className="pt-2 text-xs font-semibold text-slate-500">
            Radar is illustrative (prototype).
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const activity = PROGRESS_DASHBOARD.activity;
  const maxMinutes = Math.max(...activity.map((a) => a.minutes));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Progress Tracking
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Weekly activity and skill growth, all in one place.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-700" />
            <p className="text-sm font-extrabold text-slate-900">This week</p>
          </div>
          <p className="mt-1 text-sm font-extrabold text-slate-700">
            {activity.reduce((acc, a) => acc + a.minutes, 0)} minutes practiced
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Weekly activity
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <div className="flex h-44 items-end gap-3">
              {activity.map((a) => {
                const height = Math.max(10, Math.round((a.minutes / maxMinutes) * 140));
                return (
                  <div key={a.day} className="flex-1 flex flex-col items-center gap-3">
                    <div
                      className="w-full rounded-2xl bg-teal-50 border border-teal-100 relative group"
                      style={{ height: 140 }}
                      title={`${a.minutes} minutes`}
                    >
                      <div
                        className="absolute inset-x-2 bottom-2 rounded-2xl bg-teal-600 transition group-hover:opacity-95"
                        style={{ height }}
                      />
                    </div>
                    <p className="text-xs font-extrabold text-slate-600">
                      {a.day}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lg:w-80 space-y-3">
            {activity.map((a) => (
              <div key={a.day} className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">{a.day}</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-700" />
                  <p className="text-sm font-extrabold text-slate-900">
                    {a.minutes}m
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <RadarChart data={PROGRESS_DASHBOARD.skills} />

        <div className="space-y-3">
          {PROGRESS_DASHBOARD.skills.map((s) => (
            <ProgressBar key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Milestones
            </p>
            <h2 className="mt-2 text-lg font-extrabold text-slate-900">
              Your achievements
            </h2>
          </div>
          <p className="text-sm font-semibold text-slate-600">
            Unlock badges by staying consistent.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PROGRESS_DASHBOARD.milestones.map((m) => {
            const unlocked = m.unlocked;
            return (
              <div
                key={m.id}
                className={cx(
                  "rounded-3xl border p-4 shadow-sm transition",
                  unlocked
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2">
                  {unlocked ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  ) : (
                    <Lock className="h-5 w-5 text-slate-400" />
                  )}
                  <p
                    className={cx(
                      "text-sm font-extrabold",
                      unlocked ? "text-emerald-900" : "text-slate-700"
                    )}
                  >
                    {m.label}
                  </p>
                </div>
                <p
                  className={cx(
                    "mt-2 text-xs font-semibold",
                    unlocked ? "text-emerald-700" : "text-slate-500"
                  )}
                >
                  {unlocked ? "Unlocked" : "Locked"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Recent sessions
            </p>
            <h2 className="mt-2 text-lg font-extrabold text-slate-900">
              Last practice lessons
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <CalendarDays className="h-5 w-5 text-teal-700" />
            <p className="text-sm font-extrabold text-slate-900">3 entries</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {PROGRESS_DASHBOARD.recentSessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-slate-900">
                  {s.tutorName}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  {s.date}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-2">
                <Clock className="h-4 w-4 text-teal-700" />
                <p className="text-sm font-extrabold text-teal-800">
                  {s.durationMinutes} min
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

