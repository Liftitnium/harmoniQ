"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationsBadgeProvider } from "@/context/NotificationsBadgeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NotificationsBadgeProvider>{children}</NotificationsBadgeProvider>
    </ThemeProvider>
  );
}
