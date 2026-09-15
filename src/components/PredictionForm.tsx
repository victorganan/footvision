"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PredictionPick } from "@/lib/types";

const PICK_LABELS: Record<PredictionPick, string> = {
  home: "Gana local",
  draw: "Empate",
  away: "Gana visitante",
};

export function PredictionForm({ matchId, maxStake }: { matchId: string; maxStake: number }) {
  const router = useRouter();
  const [pick, setPick] = useState<PredictionPick | null>(null);
  const [stake, setStake] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!pick) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/predicciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, pick, stake }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error inesperado");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-2 border-t border-pitch-border pt-3">
      <div className="flex gap-2">
        {(Object.keys(PICK_LABELS) as PredictionPick[]).map((p) => (
          <button
            key={p}
            onClick={() => setPick(p)}
            className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
              pick === p ? "border-accent bg-accent/10 text-accent" : "border-pitch-border text-slate-400 hover:text-white"
            }`}
          >
            {PICK_LABELS[p]}
          </button>
        ))}
      </div>

      {maxStake > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Apostar (opcional, doble o nada):</span>
          <input
            type="number"
            min={0}
            max={maxStake}
            value={stake}
            onChange={(e) => setStake(Math.max(0, Math.min(maxStake, Number(e.target.value))))}
            className="w-20 rounded-md border border-pitch-border bg-pitch px-2 py-1 text-white"
          />
          <span>/ {maxStake} 🪙</span>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!pick || loading}
        className="w-full rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-pitch hover:bg-accent-dark disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Confirmar predicción"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
