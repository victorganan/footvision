"use client";

import { useState } from "react";
import Link from "next/link";
import { ScoutingReportButton } from "./ScoutingReportButton";

interface ResultPlayer {
  id: string;
  slug: string;
  name: string;
  age: number;
  position: string;
  foot: string;
  heightCm: number;
  marketValueM: number;
  team: { name: string } | null;
}

const POSITIONS = ["Portero", "Defensa", "Centrocampista", "Delantero"];
const FEET = ["Izquierda", "Derecha", "Ambidiestro"];
const LEAGUES = ["LaLiga", "Premier League", "Bundesliga", "Ligue 1"];

export function ScoutingSearch() {
  const [query, setQuery] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [maxValueM, setMaxValueM] = useState("");
  const [position, setPosition] = useState("");
  const [league, setLeague] = useState("");
  const [foot, setFoot] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultPlayer[] | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/ojeo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query || undefined,
          maxAge: maxAge ? Number(maxAge) : undefined,
          maxValueM: maxValueM ? Number(maxValueM) : undefined,
          position: position || undefined,
          league: league || undefined,
          foot: foot || undefined,
        }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-4 rounded-xl border border-pitch-border bg-pitch-card p-5">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-400">
            Describe lo que buscas (lenguaje natural)
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: delantero menor de 22 años, zurdo, menos de 15M"
            className="w-full rounded-lg border border-pitch-border bg-pitch px-3 py-2 text-sm text-white placeholder:text-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <input
            value={maxAge}
            onChange={(e) => setMaxAge(e.target.value)}
            type="number"
            placeholder="Edad máx."
            className="rounded-lg border border-pitch-border bg-pitch px-3 py-2 text-sm text-white placeholder:text-slate-500"
          />
          <input
            value={maxValueM}
            onChange={(e) => setMaxValueM(e.target.value)}
            type="number"
            placeholder="Valor máx. (M€)"
            className="rounded-lg border border-pitch-border bg-pitch px-3 py-2 text-sm text-white placeholder:text-slate-500"
          />
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="rounded-lg border border-pitch-border bg-pitch px-3 py-2 text-sm text-white"
          >
            <option value="">Posición</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            className="rounded-lg border border-pitch-border bg-pitch px-3 py-2 text-sm text-white"
          >
            <option value="">Liga</option>
            {LEAGUES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select
            value={foot}
            onChange={(e) => setFoot(e.target.value)}
            className="rounded-lg border border-pitch-border bg-pitch px-3 py-2 text-sm text-white"
          >
            <option value="">Pierna</option>
            {FEET.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-pitch hover:bg-accent-dark disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Buscar (gratis)"}
        </button>
      </form>

      {results && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">{results.length} jugadores encontrados</p>
          {results.map((p) => (
            <div key={p.id} className="rounded-xl border border-pitch-border bg-pitch-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link href={`/jugadores/${p.slug}`} className="font-semibold text-white hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {p.team?.name ?? "Agente libre"} · {p.position} · {p.age} años · {p.foot} · {p.heightCm}cm
                  </p>
                </div>
                <span className="font-bold text-accent">{p.marketValueM}M€</span>
              </div>
              <ScoutingReportButton playerId={p.id} playerName={p.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
