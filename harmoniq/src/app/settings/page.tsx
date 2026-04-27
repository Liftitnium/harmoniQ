"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/harmoniq/Modal";
import { useToast } from "@/components/harmoniq/toast/ToastProvider";
import { useTheme } from "@/context/ThemeContext";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw } from "lucide-react";

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
  const router = useRouter();
  const [active, setActive] = useState<SectionId>("account");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [instrument, setInstrument] = useState("Guitar");
  const [level, setLevel] = useState("Intermediate");
  const [goal, setGoal] = useState("30");

  const [emailRem, setEmailRem] = useState(true);
  const [push, setPush] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  const [showProfile, setShowProfile] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [retaking, setRetaking] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (profile?.display_name) {
        setName(profile.display_name);
      } else {
        setName(user.email?.split("@")[0] ?? "");
      }
    }
    loadUser();
  }, []);

  const handleRetakeSurvey = async () => {
    setRetaking(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("survey_responses").delete().eq("user_id", user.id);
      await supabase.from("roadmaps").delete().eq("user_id", user.id);
      await supabase.from("profiles").update({ onboarded: false }).eq("id", user.id);

      router.push("/onboarding");
    } catch {
      addToast({ kind: "error", title: "Error", message: "Could not reset survey. Try again." });
      setRetaking(false);
    }
  };

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
          {active === "account" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Account</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">Update your public profile details.</p>
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-teal-200 focus:ring-2 focus:ring-teal-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-teal-800 dark:focus:ring-teal-950/50" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-teal-200 focus:ring-2 focus:ring-teal-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Bio</span>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-teal-200 focus:ring-2 focus:ring-teal-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                </label>
                <button type="button" onClick={() => addToast({ kind: "success", title: "Saved", message: "Changes saved (prototype)." })} className="inline-flex h-11 items-center justify-center rounded-2xl bg-teal-700 px-6 text-sm font-extrabold text-white hover:bg-teal-800">
                  Save Changes
                </button>
              </div>
            </section>
          )}

          {active === "learning" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Learning Preferences</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Primary instrument</span>
                  <select value={instrument} onChange={(e) => setInstrument(e.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                    <option>Guitar</option><option>Piano</option><option>Violin</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Skill level</span>
                  <select value={level} onChange={(e) => setLevel(e.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Practice goal / day</span>
                  <select value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                    <option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <p className="text-sm font-extrabold text-amber-900 dark:text-amber-200">Want a fresh start?</p>
                <p className="mt-1 text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Retake the onboarding survey to regenerate your roadmap from scratch.
                </p>
                <button
                  type="button"
                  disabled={retaking}
                  onClick={handleRetakeSurvey}
                  className="mt-3 inline-flex h-10 items-center gap-2 rounded-2xl border border-amber-300 bg-white px-4 text-sm font-extrabold text-amber-900 transition hover:bg-amber-100 disabled:opacity-50 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/40"
                >
                  <RefreshCw className={`h-4 w-4 ${retaking ? "animate-spin" : ""}`} />
                  {retaking ? "Resetting…" : "Retake onboarding survey"}
                </button>
              </div>
            </section>
          )}

          {active === "notifications" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Notifications</h2>
              <div className="mt-5 space-y-4">
                {(
                  [
                    ["Email reminders", emailRem, setEmailRem],
                    ["Push notifications", push, setPush],
                    ["Weekly progress report", weeklyReport, setWeeklyReport],
                  ] as const
                ).map(([label, on, setOn]) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{label}</span>
                    <button type="button" role="switch" aria-checked={on} onClick={() => setOn(!on)} className={`relative h-7 w-12 rounded-full transition ${on ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700"}`}>
                      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${on ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "appearance" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Appearance</h2>
              <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Dark mode</span>
                <button type="button" role="switch" aria-checked={theme === "dark"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className={`relative h-7 w-12 rounded-full transition ${theme === "dark" ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700"}`}>
                  <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${theme === "dark" ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            </section>
          )}

          {active === "privacy" && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Privacy</h2>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Show profile publicly</span>
                  <button type="button" role="switch" aria-checked={showProfile} onClick={() => setShowProfile((v) => !v)} className={`relative h-7 w-12 rounded-full transition ${showProfile ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700"}`}>
                    <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${showProfile ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </section>
          )}

          {active === "danger" && (
            <section className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
              <h2 className="text-lg font-black text-red-900 dark:text-red-200">Danger Zone</h2>
              <p className="mt-1 text-sm font-semibold text-red-800 dark:text-red-300">Deleting your account is permanent in a real app. Here it is UI-only.</p>
              <button type="button" onClick={() => setDeleteOpen(true)} className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-red-600 px-6 text-sm font-extrabold text-white hover:bg-red-700">
                Delete Account
              </button>
            </section>
          )}
        </div>
      </div>

      <Modal open={deleteOpen} title="Delete account?" onClose={() => setDeleteOpen(false)}>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">This is a prototype — nothing will be deleted.</p>
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={() => setDeleteOpen(false)} className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white text-sm font-extrabold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">Cancel</button>
          <button type="button" onClick={() => { setDeleteOpen(false); addToast({ kind: "info", title: "Not deleted", message: "Prototype only." }); }} className="h-11 flex-1 rounded-2xl bg-red-600 text-sm font-extrabold text-white hover:bg-red-700">Confirm</button>
        </div>
      </Modal>
    </div>
  );
}
