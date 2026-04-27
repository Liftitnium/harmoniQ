"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastKind = "success" | "info" | "warning" | "error";

export type Toast = {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
};

type ToastContextValue = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const next: Toast = { id, ...toast };
      setToasts((prev) => [next, ...prev].slice(0, 4));

      // Auto-dismiss after a short delay.
      window.setTimeout(() => {
        dismissToast(id);
      }, 3200);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      dismissToast,
    }),
    [toasts, addToast, dismissToast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

