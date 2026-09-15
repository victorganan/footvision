"use client";

import { useState } from "react";
import type { NextClubPrediction } from "@/lib/scouting";

export function NextClubPredictor({ playerId }: { playerId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<NextClubPrediction | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jugadores/prediccion-club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error inesperado");
      setPrediction(data.prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (prediction) {
    return (
      <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
        <h3 className="mb-2 font-display text-sm font-bold text-gold">Predicción de próximo club</h3>
        <p className="mb-3 text-sm text-slate-300">{prediction.summary}</p>
        <ul className="space-y-2">
          {prediction.candidateClubs.map((c, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-pitch-card p-2 text-sm">
              <span className="text-white">{c.club}</span>
              <span className="font-semibold text-gold">{c.probability}%</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition hover:bg-gold/20 disabled:opacity-50"
      >
        {loading ? "Analizando..." : "🪙 Predicción de próximo club (8 FootCoins)"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
