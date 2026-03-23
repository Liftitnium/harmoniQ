import React from "react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/50">
        <div className="h-4 w-4 rounded-lg bg-teal-700" />
      </div>
      <div className="leading-none">
        <p className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Harmoni<span className="text-teal-700 dark:text-teal-400">Q</span>
        </p>
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          Music learning
        </p>
      </div>
    </div>
  );
}

