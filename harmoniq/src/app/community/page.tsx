"use client";

import React, { useState } from "react";
import {
  COMMUNITY_POSTS,
  COMMUNITY_TRENDING_TAGS,
  SUGGESTED_LEARNERS,
  type CommunityPost,
} from "@/lib/data";
import { Hash, Heart, MessageCircle, PenLine, Send, Sparkles, TrendingUp, UserPlus } from "lucide-react";

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(() =>
    COMMUNITY_POSTS.map((p) => ({ ...p, likedByMe: false }))
  );
  const [composer, setComposer] = useState("");
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  const submitPost = () => {
    const text = composer.trim();
    if (!text) return;
    const np: CommunityPost = {
      id: `new-${Date.now()}`,
      userInitials: "RN",
      username: "Raji N.",
      timestamp: "Just now",
      text,
      tag: "#Thoughts",
      type: "general",
      likes: 0,
      comments: 0,
      likedByMe: false,
    };
    setPosts((p) => [np, ...p]);
    setComposer("");
  };

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const liked = !p.likedByMe;
        return {
          ...p,
          likedByMe: liked,
          likes: p.likes + (liked ? 1 : -1),
        };
      })
    );
  };

  const submitReply = (postId: string) => {
    const t = replyText.trim();
    if (!t) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: p.comments + 1 } : p
      )
    );
    setReplyText("");
    setReplyOpen(null);
  };

  const toggleFollow = (id: string) => {
    setFollowing((f) => ({ ...f, [id]: !f[id] }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        Community
      </h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,240px)]">
        <aside className="hidden flex-col gap-2 lg:flex">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Explore
          </p>
          <button
            type="button"
            className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-left text-sm font-extrabold text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-100"
          >
            Feed
          </button>
          <button
            type="button"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-extrabold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            My Posts
          </button>
          <button
            type="button"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-extrabold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            Trending
          </button>
          <button
            type="button"
            className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-teal-700 px-4 text-sm font-extrabold text-white hover:bg-teal-800"
          >
            <PenLine className="h-4 w-4" />
            New Post
          </button>
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              What&apos;s on your mind?
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitPost()}
                placeholder="Share a tip, question, or win..."
                className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={submitPost}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 text-sm font-extrabold text-white hover:bg-teal-800"
              >
                Post
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            <span className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-extrabold dark:border-slate-700">
              Feed
            </span>
            <span className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-extrabold dark:border-slate-700">
              My Posts
            </span>
            <span className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-extrabold dark:border-slate-700">
              Trending
            </span>
          </div>

          <div className="space-y-3">
            {posts.map((p) => (
              <article
                key={p.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-xs font-extrabold text-teal-900 dark:bg-teal-950/50 dark:text-teal-200">
                    {p.userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-extrabold text-slate-900 dark:text-slate-100">{p.username}</p>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {p.timestamp}
                      </span>
                      {p.type === "milestone" ? (
                        <Sparkles className="h-4 w-4 text-amber-500" />
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
                      {p.text}
                    </p>
                    {p.tag ? (
                      <p className="mt-2 text-sm font-extrabold text-teal-700 dark:text-teal-400">
                        {p.tag}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleLike(p.id)}
                        className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-extrabold transition ${
                          p.likedByMe
                            ? "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-100"
                            : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <Heart
                          className="h-4 w-4"
                          fill={p.likedByMe ? "currentColor" : "none"}
                        />
                        {p.likes}
                      </button>
                      <span className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                        <MessageCircle className="h-4 w-4" />
                        {p.comments} comments
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setReplyOpen((id) => (id === p.id ? null : p.id))
                        }
                        className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                      >
                        Reply
                      </button>
                    </div>
                    {replyOpen === p.id ? (
                      <div className="mt-3 flex gap-2">
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="h-10 flex-1 rounded-2xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => submitReply(p.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-white"
                          aria-label="Send reply"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>

        <aside className="hidden flex-col gap-6 lg:flex">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-700 dark:text-teal-400" />
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Trending Topics
              </h2>
            </div>
            <ul className="mt-4 space-y-2">
              {COMMUNITY_TRENDING_TAGS.map((tag) => (
                <li
                  key={tag}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-extrabold text-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                  <Hash className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Suggested Learners
            </h2>
            <ul className="mt-4 space-y-3">
              {SUGGESTED_LEARNERS.map((u) => {
                const isF = following[u.id];
                return (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 p-3 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-extrabold dark:bg-slate-800">
                        {u.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">
                          {u.name}
                        </p>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {u.instrument}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFollow(u.id)}
                      className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-extrabold ${
                        isF
                          ? "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/40"
                          : "border-slate-200 text-slate-800 dark:border-slate-600 dark:text-slate-200"
                      }`}
                    >
                      <UserPlus className="mr-1 inline h-3.5 w-3.5" />
                      {isF ? "Following" : "Follow"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
