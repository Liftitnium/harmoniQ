"use client";

import React from "react";
import Link from "next/link";
import { NAV_ITEMS } from "./navItems";
import type { NavItem } from "./navItems";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function BottomNav({ activePath }: { activePath: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden"
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center gap-1 overflow-x-auto px-2 pb-safe pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_ITEMS.map((item: NavItem) => {
          const isActive = activePath === item.href;
          const Icon = item.Icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cx(
                "group relative flex min-w-[4.25rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 transition",
                isActive
                  ? "text-teal-700 dark:text-teal-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <span className="relative">
                <Icon
                  className={cx(
                    "h-5 w-5 transition",
                    isActive
                      ? "text-teal-700 dark:text-teal-400"
                      : "text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200"
                  )}
                />
                {item.badgeCount != null && item.badgeCount > 0 ? (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-600 px-0.5 text-[9px] font-extrabold text-white">
                    {item.badgeCount > 9 ? "9+" : item.badgeCount}
                  </span>
                ) : null}
              </span>
              <span className="max-w-[4.25rem] truncate text-center text-[10px] font-semibold leading-tight">
                {item.label}
              </span>
              {isActive ? (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-teal-600 dark:bg-teal-400" />
              ) : (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-transparent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

