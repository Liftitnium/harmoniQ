"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { NOTIFICATIONS_UNREAD_COUNT } from "@/lib/data";

type Value = {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
};

const Ctx = createContext<Value | null>(null);

export function NotificationsBadgeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(NOTIFICATIONS_UNREAD_COUNT);

  const value = useMemo(
    () => ({ unreadCount, setUnreadCount }),
    [unreadCount]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNotificationsBadge() {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error("useNotificationsBadge must be used within provider");
  }
  return v;
}
