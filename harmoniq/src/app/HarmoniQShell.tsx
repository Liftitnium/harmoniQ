"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarNav } from "@/components/harmoniq/navigation/SidebarNav";
import { BottomNav } from "@/components/harmoniq/navigation/BottomNav";
import { ToastViewport } from "@/components/harmoniq/toast/ToastViewport";
import { ToastProvider } from "@/components/harmoniq/toast/ToastProvider";
import { TopBar } from "@/components/harmoniq/TopBar";

export function HarmoniQShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <TopBar />
          <div className="flex gap-6">
            <aside className="hidden w-64 shrink-0 lg:block pb-10 pt-2">
              <SidebarNav activePath={pathname} />
            </aside>

            <main className="flex-1 pb-28 pt-0 lg:pb-10 lg:pt-2">
              <div key={pathname} className="animate-page-in">
                {children}
              </div>
            </main>
          </div>
        </div>

        <div className="lg:hidden">
          <BottomNav activePath={pathname} />
        </div>

        <ToastViewport />
      </div>
    </ToastProvider>
  );
}

