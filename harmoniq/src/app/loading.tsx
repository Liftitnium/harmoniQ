export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/50">
          <div className="h-5 w-5 animate-pulse rounded-lg bg-teal-700" />
        </div>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          Loading…
        </p>
      </div>
    </div>
  );
}
