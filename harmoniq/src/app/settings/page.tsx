"use client";

import React, { useState } from "react";
import { Modal } from "@/components/harmoniq/Modal";
import { useToast } from "@/components/harmoniq/toast/ToastProvider";
import { useTheme } from "@/context/ThemeContext";
import { SETTINGS_DEFAULTS } from "@/lib/data";

const SECTIONS = [
  { id: "account", label: "Account" },
  { id: "learning", label: "Learning Preferences" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "privacy", label: "Privacy" },
  { id: "danger", label: "Danger Zone" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function SettingsPage() {
  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState<SectionId>("account");
  const [name, setName] = useState<string>(SETTINGS_DEFAULTS.name);
  const [email, setEmail] = useState<string>(SETTINGS_DEFAULTS.email);
  const [bio, setBio] = useState<string>(SETTINGS_DEFAULTS.bio);
  const [instrument, setInstrument] = useState<string>(SETTINGS_DEFAULTS.primaryInstrument);
  const [level, setLevel] = useState<string>(SETTINGS_DEFAULTS.skillLevel);
  const [goal, setGoal] = useState(String(SETTINGS_DEFAULTS.practiceGoalMinutes));
  const [lessonFormat, setLessonFormat] = useState<"in_person" | "online">(
    SETTINGS_DEFAULTS.lessonFormat
  );

  const [emailRem, setEmailRem] = useState(true);
  const [push, setPush] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [tutorMsg, setTutorMsg] = useState(true);
  const [communityRep, setCommunityRep] = useState(false);

  const [showProfile, setShowProfile] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        Settings
      </h1>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav className="flex shrink-0 gap-2 overflow-x-auto lg:w-52 lg:flex-col lg:overflow-visible">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={`shrink-0 rounded-2xl border px-4 py-2.5 text-left text-sm font-extrabold transition lg:w-full ${
                active === s.id
                  ? "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-100"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 space-y-6">
          {active === "account" ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Account</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
                Update your public profile details.
              </p>
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-teal-200 focus:ring-2 focus:ring-teal-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-teal-800 dark:focus:ring-teal-950/50"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-teal-200 focus:ring-2 focus:ring-teal-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Bio</span>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-teal-200 focus:ring-2 focus:ring-teal-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    addToast({ kind: "success", title: "Saved", message: "Changes saved (prototype)." })
                  }
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-teal-700 px-6 text-sm font-extrabold text-white hover:bg-teal-800"
                >
                  Save Changes
                </button>
              </div>
            </section>
          ) : null}

          {active === "learning" ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Learning Preferences
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Primary instrument
                  </span>
                  <select
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option>Guitar</option>
                    <option>Piano</option>
                    <option>Violin</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Skill level
                  </span>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Practice goal / day
                  </span>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                  </select>
                </label>
                <div className="sm:col-span-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Preferred lesson format
                  </p>
                  <div className="mt-2 inline-flex rounded-2xl border border-slate-200 p-1 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setLessonFormat("in_person")}
                      className={`rounded-xl px-4 py-2 text-sm font-extrabold ${
                        lessonFormat === "in_person"
                          ? "bg-teal-700 text-white"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      In-person
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonFormat("online")}
                      className={`rounded-xl px-4 py-2 text-sm font-extrabold ${
                        lessonFormat === "online"
                          ? "bg-teal-700 text-white"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      Online
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {active === "notifications" ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Notifications</h2>
              <div className="mt-5 space-y-4">
                {(
                  [
                    ["Email reminders", emailRem, setEmailRem],
                    ["Push notifications", push, setPush],
                    ["Weekly progress report", weeklyReport, setWeeklyReport],
                    ["New tutor messages", tutorMsg, setTutorMsg],
                    ["Community replies", communityRep, setCommunityRep],
                  ] as const
                ).map(([label, on, setOn]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700"
                  >
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                      {label}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      onClick={() => setOn(!on)}
                      className={`relative h-7 w-12 rounded-full transition ${
                        on ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                          on ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {active === "appearance" ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Appearance</h2>
              <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  Dark mode
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={theme === "dark"}
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={`relative h-7 w-12 rounded-full transition ${
                    theme === "dark" ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                      theme === "dark" ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </section>
          ) : null}

          {active === "privacy" ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Privacy</h2>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    Show profile to community
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showProfile}
                    onClick={() => setShowProfile((v) => !v)}
                    className={`relative h-7 w-12 rounded-full transition ${
                      showProfile ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                        showProfile ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    Show progress on leaderboard
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showLeaderboard}
                    onClick={() => setShowLeaderboard((v) => !v)}
                    className={`relative h-7 w-12 rounded-full transition ${
                      showLeaderboard ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                        showLeaderboard ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {active === "danger" ? (
            <section className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
              <h2 className="text-lg font-black text-red-900 dark:text-red-200">Danger Zone</h2>
              <p className="mt-1 text-sm font-semibold text-red-800 dark:text-red-300">
                Deleting your account is permanent in a real app. Here it is UI-only.
              </p>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-red-600 px-6 text-sm font-extrabold text-white hover:bg-red-700"
              >
                Delete Account
              </button>
            </section>
          ) : null}
        </div>
      </div>

      <Modal
        open={deleteOpen}
        title="Delete account?"
        onClose={() => setDeleteOpen(false)}
      >
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          This is a prototype — nothing will be deleted.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setDeleteOpen(false)}
            className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white text-sm font-extrabold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setDeleteOpen(false);
              addToast({ kind: "info", title: "Not deleted", message: "Prototype only." });
            }}
            className="h-11 flex-1 rounded-2xl bg-red-600 text-sm font-extrabold text-white hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
}
