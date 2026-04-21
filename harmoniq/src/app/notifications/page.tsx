"use client";

import React, { useMemo, useState } from "react";
import { Calendar, CheckCheck, Music, Trophy } from "lucide-react";
import { useNotificationsBadge } from "@/context/NotificationsBadgeContext";

type NotificationKind = "calendar" | "trophy" | "music";

interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  timestamp: string;
  group: "today" | "earlier";
  unread: boolean;
}

const NOTIFICATIONS: Notification[] = [
  { id: "n1", kind: "trophy", title: "Week 2 complete!", description: "You finished Week 2 of your roadmap — nice work!", timestamp: "9:42 AM", group: "today", unread: true },
  { id: "n2", kind: "calendar", title: "Today's practice", description: "You have 3 tasks on today's roadmap — start with your warm-up.", timestamp: "8:15 AM", group: "today", unread: true },
  { id: "n3", kind: "trophy", title: "Badge unlocked: 7-Day Streak", description: "You completed tasks 7 days in a row. Keep it up!", timestamp: "Yesterday", group: "earlier", unread: false },
  { id: "n4", kind: "music", title: "Roadmap adapted", description: "Your plan was adjusted based on Week 1 difficulty ratings.", timestamp: "Mon", group: "earlier", unread: false },
];

function IconFor({ kind }: { kind: NotificationKind }) {
  const cls = "h-5 w-5 text-teal-700 dark:text-teal-400";
  switch (kind) {
    case "calendar": return <Calendar className={cls} />;
    case "trophy": return <Trophy className={cls} />;
    case "music": return <Music className={cls} />;
  }
}

export default function NotificationsPage() {
  const { setUnreadCount } = useNotificationsBadge();
  const [items, setItems] = useState(() => NOTIFICATIONS.map((n) => ({ ...n })));

  const today = useMemo(() => items.filter((i) => i.group === "today"), [items]);
  const earlier = useMemo(() => items.filter((i) => i.group === "earlier"), [items]);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  const Row = (n: (typeof items)[number]) => (
    <div key={n.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/50">
        <IconFor kind={n.kind} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{n.title}</p>
        <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">{n.description}</p>
        <p className="mt-2 text-xs font-bold text-slate-500">{n.timestamp}</p>
      </div>
      <div className="flex shrink-0 items-start pt-1">
        {n.unread ? <span className="h-2.5 w-2.5 rounded-full bg-teal-600 dark:bg-teal-400" title="Unread" /> : <span className="h-2.5 w-2.5 rounded-full bg-transparent" />}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">Notifications</h1>
        <button type="button" onClick={markAllRead} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-800 transition hover:border-teal-200 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-teal-800">
          <CheckCheck className="h-4 w-4 text-teal-700 dark:text-teal-400" />Mark all as read
        </button>
      </div>
      {today.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Today</h2>
          <div className="space-y-2">{today.map(Row)}</div>
        </section>
      )}
      {earlier.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Earlier</h2>
          <div className="space-y-2">{earlier.map(Row)}</div>
        </section>
      )}
    </div>
  );
}
