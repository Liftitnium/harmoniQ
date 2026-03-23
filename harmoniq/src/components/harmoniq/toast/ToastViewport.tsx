"use client";

import React from "react";
import { X } from "lucide-react";
import { useToast } from "./ToastProvider";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((toast) => {
        const tone =
          toast.kind === "success"
            ? {
                bar: "bg-emerald-500",
                border: "border-emerald-200",
                text: "text-emerald-900",
                icon: "text-emerald-700",
              }
            : toast.kind === "error"
              ? {
                  bar: "bg-rose-500",
                  border: "border-rose-200",
                  text: "text-rose-900",
                  icon: "text-rose-700",
                }
              : {
                  bar: "bg-teal-500",
                  border: "border-teal-200",
                  text: "text-teal-900",
                  icon: "text-teal-700",
                };

        return (
          <div
            key={toast.id}
            className={cx(
              "relative overflow-hidden rounded-2xl border bg-white px-4 py-3 shadow-sm",
              tone.border
            )}
            role="status"
            aria-live="polite"
          >
            <div className={cx("absolute left-0 top-0 h-full w-1", tone.bar)} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={cx("text-sm font-extrabold", tone.text)}>
                  {toast.title}
                </p>
                {toast.message ? (
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {toast.message}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

