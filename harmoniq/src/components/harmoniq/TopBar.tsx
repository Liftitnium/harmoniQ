"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Logo } from "./Logo";
import { useToast } from "./toast/ToastProvider";
import { useNotificationsBadge } from "@/context/NotificationsBadgeContext";

export function TopBar() {
  const { addToast } = useToast();
  const { unreadCount } = useNotificationsBadge();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 lg:hidden">
          <Logo />
        </div>
        <div className="hidden lg:block lg:flex-1" aria-hidden />

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-800 dark:hover:bg-teal-950/40"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-teal-700 dark:text-teal-400" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:border-teal-200 hover:bg-teal-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-800 dark:hover:bg-teal-950/40"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-sm font-extrabold text-white">
                R
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition dark:text-slate-400 ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <Link
                  href="/profile"
                  role="menuitem"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  role="menuitem"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                  Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-bold text-slate-800 transition hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
                  onClick={() => {
                    setMenuOpen(false);
                    addToast({
                      kind: "info",
                      title: "Logged out",
                      message: "Prototype only — no session to clear.",
                    });
                  }}
                >
                  <LogOut className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Log Out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
