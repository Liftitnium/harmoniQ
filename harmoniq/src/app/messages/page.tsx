"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ArrowLeft, Circle, Send } from "lucide-react";
import { MESSAGE_CONVERSATIONS, type ChatMessage, type MessageConversation } from "@/lib/data";

function cloneConversations(): MessageConversation[] {
  return MESSAGE_CONVERSATIONS.map((c) => ({
    ...c,
    messages: c.messages.map((m) => ({ ...m })),
  }));
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState(cloneConversations);
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId),
    [conversations, activeId]
  );

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || !activeId) return;
    const newMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      from: "student",
      text,
      timestamp: "Just now",
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastPreview: text.slice(0, 48),
              lastTime: "Just now",
            }
          : c
      )
    );
    setDraft("");
  }, [draft, activeId]);

  const openChat = (id: string) => {
    setActiveId(id);
    setMobileShowChat(true);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        Messages
      </h1>

      <div className="flex min-h-[520px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row">
        <aside
          className={`w-full shrink-0 border-b border-slate-200 dark:border-slate-800 lg:w-80 lg:border-b-0 lg:border-r ${
            mobileShowChat ? "hidden lg:block" : "block"
          }`}
        >
          <div className="p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Conversations
            </p>
          </div>
          <ul className="max-h-[420px] overflow-y-auto lg:max-h-none">
            {conversations.map((c) => {
              const sel = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => openChat(c.id)}
                    className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/80 ${
                      sel ? "bg-teal-50 dark:bg-teal-950/30" : ""
                    }`}
                  >
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xs font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {c.tutorInitials}
                      {c.unread ? (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-teal-600 ring-2 ring-white dark:ring-slate-900" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-extrabold ${
                          c.unread
                            ? "text-slate-900 dark:text-slate-100"
                            : "font-bold text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {c.tutorName}
                      </p>
                      <p className="truncate text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {c.lastPreview}
                      </p>
                      <p className="mt-1 text-[11px] font-bold text-slate-500">{c.lastTime}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section
          className={`flex min-h-[480px] flex-1 flex-col ${
            mobileShowChat ? "flex" : "hidden lg:flex"
          }`}
        >
          {active ? (
            <>
              <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 lg:hidden dark:border-slate-700"
                  onClick={() => setMobileShowChat(false)}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xs font-extrabold dark:bg-slate-800">
                  {active.tutorInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold text-slate-900 dark:text-slate-100">
                    {active.tutorName}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <Circle
                      className={`h-2 w-2 ${active.online ? "fill-emerald-500 text-emerald-500" : "fill-slate-400 text-slate-400"}`}
                    />
                    {active.online ? "Online" : "Offline"}
                  </p>
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950/40">
                {active.messages.map((m) => {
                  const mine = m.from === "student";
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-semibold ${
                          mine
                            ? "bg-teal-700 text-white dark:bg-teal-600"
                            : "border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        }`}
                      >
                        <p>{m.text}</p>
                        <p
                          className={`mt-1 text-[11px] font-bold ${
                            mine ? "text-teal-100" : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {m.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 p-3 dark:border-slate-800">
                <div className="flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") send();
                    }}
                    placeholder="Type a message..."
                    className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-teal-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={send}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-white hover:bg-teal-800"
                    aria-label="Send"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm font-semibold text-slate-500">
              Select a conversation
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
