"use client";

import { useState } from "react";

interface Report {
  fitSummary: string;
  comparison: string;
  valueEvolution: string;
  risk: string;
  potential: string;
  interestedClubs: string[];
  generatedBy: "openai" | "heuristic";
}

export function ScoutingReportButton({ playerId, playerName }: { playerId: string; playerName: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ojeo/informe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error inesperado");
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (report) {
    return (
      <div className="mt-3 space-y-3 rounded-lg border border-gold/30 bg-gold/5 p-4 text-sm">
        <h4 className="font-display font-bold text-gold">Informe profesional · {playerName}</h4>
        <p><span className="font-semibold text-white">Por qué encaja: </span>{report.fitSummary}</p>
        <p><span className="font-semibold text-white">Comparativa: </span>{report.comparison}</p>
        <p><span className="font-semibold text-white">Evolución de valor: </span>{report.valueEvolution}</p>
        <p><span className="font-semibold text-white">Riesgo: </span>{report.risk}</p>
        <p><span className="font-semibold text-white">Potencial: </span>{report.potential}</p>
        {report.interestedClubs?.length > 0 && (
          <p><span className="font-semibold text-white">Clubes interesados: </span>{report.interestedClubs.join(", ")}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-pitch hover:bg-accent-dark disabled:opacity-50"
      >
        {loading ? "Generando..." : "Generar informe profesional (5 FootCoins)"}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
