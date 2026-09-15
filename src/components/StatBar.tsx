export function StatBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  const homePct = (home / total) * 100;

  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-sm text-slate-300">
        <span className="font-semibold text-white">{home}</span>
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-white">{away}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-pitch-border">
        <div className="bg-accent" style={{ width: `${homePct}%` }} />
        <div className="flex-1 bg-slate-500" />
      </div>
    </div>
  );
}
