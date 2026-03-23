"use client";

import React from "react";
import Link from "next/link";
import { NAV_ITEMS } from "./navItems";
import { Logo } from "../Logo";
import type { NavItem } from "./navItems";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function SidebarNav({ activePath }: { activePath: string }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-2">
        <Logo />
      </div>

      <nav className="mt-7 flex flex-col gap-2">
        {NAV_ITEMS.map((item: NavItem) => {
          const isActive = activePath === item.href;
          const Icon = item.Icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cx(
                "group flex items-center gap-3 rounded-2xl border px-4 py-3 transition",
                "bg-white dark:bg-slate-900",
                isActive
                  ? "border-teal-200 bg-teal-50 text-teal-800 shadow-sm dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-100"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/80"
              )}
            >
              <Icon
                className={cx(
                  "h-5 w-5 shrink-0 transition",
                  isActive
                    ? "text-teal-700 dark:text-teal-400"
                    : "text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200"
                )}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {item.label}
              </span>
              {item.badgeCount != null && item.badgeCount > 0 ? (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 px-1.5 text-[10px] font-extrabold text-white dark:bg-teal-500">
                  {item.badgeCount > 9 ? "9+" : item.badgeCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto py-6 px-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Learn with momentum
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            Small daily practice, big progress.
          </p>
        </div>
      </div>
    </div>
  );
}

