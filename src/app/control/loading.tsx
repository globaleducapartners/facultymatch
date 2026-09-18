export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden="true">
      <div className="h-8 w-64 rounded-lg bg-slate-200/70" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-200/70" />
        ))}
      </div>
    </div>
  );
}
