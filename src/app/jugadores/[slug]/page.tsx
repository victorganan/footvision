import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlayerBySlug, getPlayers, getTeamById } from "@/lib/football-data";
import { TeamBadge } from "@/components/TeamBadge";
import { AdSlot } from "@/components/AdSlot";
import { NextClubPredictor } from "@/components/NextClubPredictor";

export default async function PlayerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = getPlayerBySlug(slug);
  if (!player) notFound();

  const team = player.teamId ? getTeamById(player.teamId) : undefined;
  const comparable = getPlayers()
    .filter((p) => p.id !== player.id && p.position === player.position)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-pitch-border bg-pitch-card p-6">
        {team && <TeamBadge team={team} size={56} />}
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{player.name}</h1>
          <p className="text-sm text-slate-400">
            {team ? `${team.name} · ` : "Agente libre · "}
            {player.position} · #{player.shirtNumber}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-accent">{player.marketValueM}M€</p>
          <p className="text-xs text-slate-500">Valor de mercado</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Edad", player.age],
          ["Altura", `${player.heightCm} cm`],
          ["Pierna", player.foot],
          ["Contrato", player.contractUntil ?? "Libre"],
          ["Nacionalidad", player.nationality],
          ["Partidos", player.stats.apps],
          ["Goles", player.stats.goals],
          ["Asistencias", player.stats.assists],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-pitch-border bg-pitch-card p-4 text-center">
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {player.injury && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          🩺 Lesión: {player.injury.description} · vuelta estimada {player.injury.expectedReturn}
        </div>
      )}

      <AdSlot className="h-20 w-full" />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
            <h2 className="mb-3 font-display text-lg font-bold text-white">Estadísticas</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300 sm:grid-cols-3">
              <li>Partidos: <b className="text-white">{player.stats.apps}</b></li>
              <li>Goles: <b className="text-white">{player.stats.goals}</b></li>
              <li>Asistencias: <b className="text-white">{player.stats.assists}</b></li>
              <li>Amarillas: <b className="text-white">{player.stats.yellowCards}</b></li>
              <li>Rojas: <b className="text-white">{player.stats.redCards}</b></li>
              <li>Min/gol: <b className="text-white">{player.stats.minutesPerGoal ?? "—"}</b></li>
            </ul>
          </section>

          <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
            <h2 className="mb-3 font-display text-lg font-bold text-white">Historial de fichajes</h2>
            {player.transferHistory.length === 0 ? (
              <p className="text-sm text-slate-500">Sin movimientos registrados.</p>
            ) : (
              <ol className="space-y-2 border-l border-pitch-border pl-4 text-sm">
                {player.transferHistory.map((t, i) => (
                  <li key={i} className="text-slate-300">
                    <span className="font-semibold text-white">{t.year}</span> — {t.from} → {t.to}
                    {t.feeM ? ` (${t.feeM}M€)` : " (cesión / libre)"}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
            <h2 className="mb-3 font-display text-lg font-bold text-white">Comparador rápido</h2>
            <p className="mb-3 text-sm text-slate-400">Otros {player.position.toLowerCase()}s del dataset:</p>
            <div className="flex flex-wrap gap-2">
              {comparable.map((p) => (
                <Link
                  key={p.id}
                  href={`/jugadores/${p.slug}`}
                  className="rounded-full border border-pitch-border px-3 py-1.5 text-xs text-slate-300 hover:border-accent hover:text-white"
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
            <h2 className="mb-3 font-display text-base font-bold text-white">Predicción IA</h2>
            <NextClubPredictor playerId={player.id} />
          </section>

          <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
            <h2 className="mb-2 font-display text-base font-bold text-white">Informe profesional</h2>
            <p className="mb-3 text-sm text-slate-400">
              Análisis completo con riesgo, potencial y clubes interesados desde el Centro de Ojeo.
            </p>
            <Link
              href={`/ojeo?playerId=${player.id}`}
              className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-pitch hover:bg-accent-dark"
            >
              Generar informe (5 FootCoins)
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
