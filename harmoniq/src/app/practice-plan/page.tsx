"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Circle, Sparkles } from "lucide-react";
import { PRACTICE_PLAN_WEEKS, type PracticeWeek } from "@/lib/data";
import { STUDENT } from "@/lib/data";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({ status }: { status: PracticeWeek["status"] }) {
  if (status === "completed") {
    return (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
        Completed
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-800">
        In Progress
      </span>
    );
  }
  return (
    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
      Upcoming
    </span>
  );
}

export default function PracticePlanPage() {
  const defaultOpen = useMemo(() => {
    const inProgress = PRACTICE_PLAN_WEEKS.find((w) => w.status === "in_progress");
    return inProgress?.id ?? PRACTICE_PLAN_WEEKS[0]?.id ?? "w1";
  }, []);

  const [openWeekId, setOpenWeekId] = useState<string>(defaultOpen);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const allTaskIds = useMemo(() => {
    return PRACTICE_PLAN_WEEKS.flatMap((w) => w.tasks.map((t) => t.id));
  }, []);

  const completedCount = allTaskIds.reduce(
    (acc, id) => acc + (checked[id] ? 1 : 0),
    0
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Practice Plan
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {STUDENT.currentInstrument} • {STUDENT.currentLevel} • 4-week roadmap
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Session progress
          </p>
          <p className="mt-1 text-sm font-extrabold text-slate-900">
            {completedCount}/{allTaskIds.length} tasks checked
          </p>
        </div>
      </div>

      <section className="space-y-3">
        {PRACTICE_PLAN_WEEKS.map((week) => {
          const isOpen = openWeekId === week.id;
          return (
            <div
              key={week.id}
              className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenWeekId(isOpen ? "" : week.id)}
                className={cx(
                  "flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition",
                  "hover:bg-slate-50"
                )}
                aria-expanded={isOpen}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={week.status} />
                    <p className="text-sm font-extrabold text-slate-900">
                      {week.label}
                    </p>
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-slate-600">
                    {week.focusSummary}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {week.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  ) : week.status === "in_progress" ? (
                    <Sparkles className="h-5 w-5 text-teal-700" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-500" />
                  )}
                  <ChevronDown
                    className={cx(
                      "h-5 w-5 text-slate-500 transition",
                      isOpen ? "rotate-180" : "rotate-0"
                    )}
                  />
                </div>
              </button>

              {isOpen ? (
                <div className="px-5 pb-5 pt-1">
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {week.tasks.map((t) => {
                      const isChecked = checked[t.id] ?? false;
                      return (
                        <label
                          key={t.id}
                          className={cx(
                            "flex items-start gap-3 rounded-2xl border px-4 py-3 transition cursor-pointer select-none",
                            isChecked
                              ? "border-teal-200 bg-teal-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          )}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-200"
                            checked={isChecked}
                            onChange={(e) => {
                              const v = e.target.checked;
                              setChecked((prev) => ({ ...prev, [t.id]: v }));
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-slate-900">
                              {t.day}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-600">
                              {t.task}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}

