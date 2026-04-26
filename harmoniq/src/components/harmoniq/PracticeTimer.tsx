"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Timer,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface PracticeTimerProps {
  taskTitle: string;
  taskDescription: string;
  durationMinutes: number;
  onComplete: (actualMinutes: number) => void;
  onCancel: () => void;
}

type TimeSig = "4/4" | "3/4" | "6/8";
const TIME_SIG_BEATS: Record<TimeSig, number> = { "4/4": 4, "3/4": 3, "6/8": 6 };

/* ------------------------------------------------------------------ */
/*  Tone.js lazy loader (avoids SSR crash)                            */
/* ------------------------------------------------------------------ */

type ToneModule = typeof import("tone");
let tonePromise: Promise<ToneModule> | null = null;

function loadTone(): Promise<ToneModule> {
  if (!tonePromise) {
    tonePromise = import("tone").catch((err) => {
      tonePromise = null;
      throw err;
    });
  }
  return tonePromise;
}

/* ------------------------------------------------------------------ */
/*  Helper: format seconds → mm:ss                                    */
/* ------------------------------------------------------------------ */

function fmt(sec: number): string {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function PracticeTimer({
  taskTitle,
  taskDescription,
  durationMinutes,
  onComplete,
  onCancel,
}: PracticeTimerProps) {
  /* ---- timer state ---- */
  const totalSec = durationMinutes * 60;
  const [remaining, setRemaining] = useState(totalSec);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Track actual practiced time (accounts for pauses / added time)
  const elapsedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---- metronome state ---- */
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [timeSig, setTimeSig] = useState<TimeSig>("4/4");
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [audioReady, setAudioReady] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);

  const toneRef = useRef<ToneModule | null>(null);
  const synthHighRef = useRef<InstanceType<ToneModule["Synth"]> | null>(null);
  const synthLowRef = useRef<InstanceType<ToneModule["Synth"]> | null>(null);
  const loopRef = useRef<InstanceType<ToneModule["Loop"]> | null>(null);
  const beatIndexRef = useRef(0);

  // Tap tempo
  const tapTimesRef = useRef<number[]>([]);

  const beatsPerMeasure = TIME_SIG_BEATS[timeSig];

  /* ---- navigation warning ---- */
  useEffect(() => {
    if (!running) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [running]);

  /* ---- timer interval ---- */
  useEffect(() => {
    if (running && !finished) {
      intervalRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setRemaining((prev) => {
          if (prev <= 1) {
            setFinished(true);
            setRunning(false);
            playCompletionChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, finished]);

  /* ---- progress fraction ---- */
  const addedSeconds = useRef(0);
  const effectiveTotal = totalSec + addedSeconds.current;
  const progressFrac = effectiveTotal > 0 ? 1 - remaining / effectiveTotal : 0;

  /* ---- completion chime ---- */
  async function playCompletionChime() {
    try {
      const Tone = toneRef.current ?? (await loadTone());
      await Tone.start();
      const synth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.3 },
      }).toDestination();
      synth.triggerAttackRelease("C5", "8n", Tone.now());
      synth.triggerAttackRelease("E5", "8n", Tone.now() + 0.15);
      synth.triggerAttackRelease("G5", "8n", Tone.now() + 0.3);
    } catch {
      // audio not available
    }
  }

  /* ---- init Tone.js on first metronome toggle ---- */
  const initAudio = useCallback(async () => {
    if (toneRef.current) return true;
    try {
      const Tone = await loadTone();
      await Tone.start();
      toneRef.current = Tone;

      synthHighRef.current = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
        volume: -6,
      }).toDestination();

      synthLowRef.current = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
        volume: -10,
      }).toDestination();

      setAudioReady(true);
      return true;
    } catch {
      setAudioFailed(true);
      return false;
    }
  }, []);

  /* ---- metronome loop ---- */
  const startMetronome = useCallback(() => {
    const Tone = toneRef.current;
    if (!Tone) return;

    Tone.getTransport().bpm.value = bpm;
    beatIndexRef.current = 0;

    if (loopRef.current) {
      loopRef.current.dispose();
    }

    const subdivision = timeSig === "6/8" ? "8n" : "4n";

    loopRef.current = new Tone.Loop((time) => {
      const idx = beatIndexRef.current % beatsPerMeasure;
      const isDownbeat = idx === 0;

      if (isDownbeat && synthHighRef.current) {
        synthHighRef.current.triggerAttackRelease("C6", "32n", time);
      } else if (synthLowRef.current) {
        synthLowRef.current.triggerAttackRelease("G5", "32n", time);
      }

      Tone.getDraw().schedule(() => {
        setCurrentBeat(idx);
      }, time);

      beatIndexRef.current += 1;
    }, subdivision).start(0);

    Tone.getTransport().start();
  }, [bpm, timeSig, beatsPerMeasure]);

  const stopMetronome = useCallback(() => {
    const Tone = toneRef.current;
    if (!Tone) return;

    Tone.getTransport().stop();
    if (loopRef.current) {
      loopRef.current.dispose();
      loopRef.current = null;
    }
    setCurrentBeat(-1);
    beatIndexRef.current = 0;
  }, []);

  /* ---- toggle metronome ---- */
  async function toggleMetronome() {
    if (metronomeOn) {
      stopMetronome();
      setMetronomeOn(false);
    } else {
      const ok = await initAudio();
      if (!ok) return;
      setMetronomeOn(true);
    }
  }

  // Start/stop loop when metronomeOn changes
  useEffect(() => {
    if (metronomeOn && audioReady) {
      startMetronome();
    } else {
      stopMetronome();
    }
  }, [metronomeOn, audioReady, startMetronome, stopMetronome]);

  // Update BPM live
  useEffect(() => {
    const Tone = toneRef.current;
    if (Tone && metronomeOn) {
      Tone.getTransport().bpm.value = bpm;
    }
  }, [bpm, metronomeOn]);

  // Restart loop when time signature changes
  useEffect(() => {
    if (metronomeOn && audioReady) {
      stopMetronome();
      startMetronome();
    }
  }, [timeSig]);

  /* ---- cleanup ---- */
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopMetronome();
      synthHighRef.current?.dispose();
      synthLowRef.current?.dispose();
    };
  }, [stopMetronome]);

  /* ---- tap tempo ---- */
  function handleTap() {
    const now = performance.now();
    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length > 5) tapTimesRef.current.shift();

    const taps = tapTimesRef.current;
    if (taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const tapBpm = Math.round(60000 / avg);
      setBpm(Math.max(40, Math.min(220, tapBpm)));
    }
  }

  /* ---- timer actions ---- */
  function handleStartPause() {
    if (finished) return;
    setRunning((prev) => !prev);
  }

  function handleReset() {
    setRunning(false);
    setFinished(false);
    setRemaining(totalSec);
    elapsedRef.current = 0;
    addedSeconds.current = 0;
  }

  function handleAddTime(seconds: number) {
    addedSeconds.current += seconds;
    setRemaining((prev) => prev + seconds);
    if (finished) {
      setFinished(false);
    }
  }

  function handleDone() {
    stopMetronome();
    const actualMinutes = Math.max(1, Math.round(elapsedRef.current / 60));
    onComplete(actualMinutes);
  }

  function handleCancel() {
    if (running || elapsedRef.current > 0) {
      setConfirmCancel(true);
    } else {
      stopMetronome();
      onCancel();
    }
  }

  function confirmCancelAction() {
    setRunning(false);
    stopMetronome();
    onCancel();
  }

  /* ---- progress ring SVG ---- */
  const ringSize = 220;
  const ringStroke = 8;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc * (1 - progressFrac);

  /* ---- render ---- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-md flex-col items-center rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-8">
        {/* Close */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
          aria-label="Cancel"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Task info */}
        <div className="mb-6 w-full text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-400">
            Practice session
          </p>
          <h2 className="mt-2 text-lg font-black text-white">
            {taskTitle}
          </h2>
          <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-400">
            {taskDescription}
          </p>
        </div>

        {/* Timer ring + display */}
        <div className="relative mb-6" style={{ width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} className="-rotate-90">
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth={ringStroke}
              className="text-slate-800"
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={ringCirc}
              strokeDashoffset={ringOffset}
              className="text-teal-500 transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl font-black tracking-tight text-white">
              {fmt(remaining)}
            </span>
            {finished && (
              <span className="mt-1 text-sm font-bold text-teal-400">
                Time&apos;s up! Great work.
              </span>
            )}
          </div>
        </div>

        {/* Timer controls */}
        {!finished ? (
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleStartPause}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg transition hover:bg-teal-500"
              aria-label={running ? "Pause" : "Start"}
            >
              {running ? (
                <Pause className="h-6 w-6" fill="currentColor" />
              ) : (
                <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleAddTime(60)}
              className="flex h-10 items-center gap-1 rounded-xl border border-slate-700 px-3 text-xs font-extrabold text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <Plus className="h-3 w-3" />
              1 min
            </button>
          </div>
        ) : (
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleAddTime(300)}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-700 px-4 text-xs font-extrabold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Plus className="h-3 w-3" />
              Keep going (+5 min)
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-teal-600 px-5 text-sm font-extrabold text-white shadow-lg transition hover:bg-teal-500"
            >
              Done
            </button>
          </div>
        )}

        {/* ---- Metronome ---- */}
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-400">
                Metronome
              </span>
            </div>
            {audioFailed ? (
              <span className="text-[10px] font-bold text-red-400">
                Audio not available
              </span>
            ) : (
              <button
                type="button"
                onClick={toggleMetronome}
                className={`relative h-6 w-11 rounded-full transition ${
                  metronomeOn ? "bg-teal-600" : "bg-slate-700"
                }`}
                aria-label="Toggle metronome"
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    metronomeOn ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            )}
          </div>

          {metronomeOn && (
            <div className="mt-4 space-y-4">
              {/* Beat indicator */}
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: beatsPerMeasure }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-3.5 w-3.5 rounded-full transition-all duration-100 ${
                      currentBeat === i
                        ? i === 0
                          ? "scale-125 bg-teal-400 shadow-lg shadow-teal-400/40"
                          : "scale-110 bg-slate-300"
                        : i === 0
                          ? "bg-teal-700"
                          : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              {/* BPM control */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBpm((b) => Math.max(40, b - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <Minus className="h-3 w-3" />
                </button>

                <div className="flex-1">
                  <input
                    type="range"
                    min={40}
                    max={220}
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-full accent-teal-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setBpm((b) => Math.min(220, b + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <Plus className="h-3 w-3" />
                </button>

                <span className="w-14 text-center font-mono text-sm font-extrabold text-white">
                  {bpm}
                </span>
              </div>

              {/* Time signature + Tap tempo */}
              <div className="flex items-center gap-2">
                {(["4/4", "3/4", "6/8"] as TimeSig[]).map((ts) => (
                  <button
                    key={ts}
                    type="button"
                    onClick={() => setTimeSig(ts)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-extrabold transition ${
                      timeSig === ts
                        ? "border-teal-600 bg-teal-600/20 text-teal-400"
                        : "border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                    }`}
                  >
                    {ts}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleTap}
                  className="ml-auto rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-extrabold text-slate-400 transition hover:border-teal-600 hover:text-teal-400 active:scale-95"
                >
                  Tap
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ---- Cancel confirm dialog ---- */}
        {confirmCancel && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-slate-950/90">
            <div className="text-center">
              <p className="text-sm font-extrabold text-white">
                End session early?
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Your progress so far won&apos;t be saved.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-extrabold text-slate-300 transition hover:bg-slate-800"
                >
                  Keep practicing
                </button>
                <button
                  type="button"
                  onClick={confirmCancelAction}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-red-500"
                >
                  End session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
