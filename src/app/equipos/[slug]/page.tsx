import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getMatchesByTeam,
  getPlayerById,
  getPlayersByTeam,
  getStandings,
  getTeamById,
  getTeamBySlug,
  getTransfers,
} from "@/lib/football-data";
import { TeamBadge } from "@/components/TeamBadge";
import { PlayerRow } from "@/components/PlayerRow";
import { MatchCard } from "@/components/MatchCard";
import { AdSlot } from "@/components/AdSlot";

export default async function TeamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) notFound();

  const squad = getPlayersByTeam(team.id).sort((a, b) => a.shirtNumber - b.shirtNumber);
  const [matches, standings] = await Promise.all([getMatchesByTeam(team.id), getStandings(team.league)]);
  const teamTransfers = getTransfers().filter((t) => t.fromTeamId === team.id || t.toTeamId === team.id);
  const injuries = squad.filter((p) => p.injury);

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4 rounded-2xl border border-pitch-border bg-pitch-card p-6">
        <TeamBadge team={team} size={64} />
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{team.name}</h1>
          {team.isExternal ? (
            <p className="text-sm text-slate-400">
              {team.league} · calendario en vivo vía football-data.org. Plantilla, mercado y lesiones
              no disponibles para este club en el dataset de demostración.
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              {team.league} · {team.stadium} · Entrenador: {team.coach} · Valor de plantilla: {team.marketValueM}M€
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="mb-4 font-display text-lg font-bold text-white">Plantilla</h2>
            <div className="grid gap-1 sm:grid-cols-2">
              {squad.map((p) => (
                <PlayerRow key={p.id} player={p} metric={{ label: "Valor", value: `${p.marketValueM}M€` }} />
              ))}
              {squad.length === 0 && <p className="text-sm text-slate-500">Sin jugadores registrados en el dataset.</p>}
            </div>
          </section>

          <AdSlot className="h-20 w-full" />

          <section>
            <h2 className="mb-4 font-display text-lg font-bold text-white">Calendario</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-lg font-bold text-white">Mercado</h2>
            {teamTransfers.length === 0 ? (
              <p className="text-sm text-slate-500">Sin movimientos registrados.</p>
            ) : (
              <div className="space-y-2">
                {teamTransfers.map((t) => {
                  const player = getPlayerById(t.playerId);
                  const from = getTeamById(t.fromTeamId);
                  const to = getTeamById(t.toTeamId);
                  if (!player) return null;
                  return (
                    <div key={t.id} className="rounded-lg border border-pitch-border bg-pitch-card p-3 text-sm">
                      <span className="font-medium text-white">{player.name}</span>{" "}
                      <span className="text-slate-500">
                        {from?.shortName} → {to?.shortName} · {t.status === "official" ? "Oficial" : t.status === "rumor" ? `Rumor ${t.probability}%` : t.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
            <h2 className="mb-3 font-display text-base font-bold text-white">Clasificación · {team.league}</h2>
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-2">Equipo</th>
                  <th className="pb-2 text-center">PJ</th>
                  <th className="pb-2 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => {
                  const t = getTeamById(row.teamId);
                  if (!t) return null;
                  return (
                    <tr key={row.teamId} className={t.id === team.id ? "text-accent" : "text-slate-300"}>
                      <td className="py-1">
                        {i + 1}. {t.shortName}
                      </td>
                      <td className="py-1 text-center">{row.played}</td>
                      <td className="py-1 text-center font-semibold">{row.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
            <h2 className="mb-3 font-display text-base font-bold text-white">Lesiones</h2>
            {injuries.length === 0 ? (
              <p className="text-sm text-slate-500">Sin lesionados registrados.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {injuries.map((p) => (
                  <li key={p.id}>
                    <Link href={`/jugadores/${p.slug}`} className="font-medium text-white hover:underline">
                      {p.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {p.injury?.description} · vuelta estimada {p.injury?.expectedReturn}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
