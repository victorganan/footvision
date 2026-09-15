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
import { getRealInjuries, getRealSquad, getRealTeamTransfers } from "@/lib/api-football";

export default async function TeamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) notFound();

  const squad = getPlayersByTeam(team.id).sort((a, b) => a.shirtNumber - b.shirtNumber);
  const [matches, standings] = await Promise.all([getMatchesByTeam(team.id), getStandings(team.league)]);
  const teamTransfers = getTransfers().filter((t) => t.fromTeamId === team.id || t.toTeamId === team.id);
  const injuries = squad.filter((p) => p.injury);

  // Para clubes que no están en el dataset curado (llegan solo vía partidos
  // reales), rellenamos plantilla/lesiones/fichajes con API-Football.
  const [realSquad, realInjuries, realTransfers] = team.isExternal
    ? await Promise.all([
        getRealSquad(team.name).catch(() => null),
        getRealInjuries(team.name).catch(() => null),
        getRealTeamTransfers(team.name).catch(() => null),
      ])
    : [null, null, null];

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4 rounded-2xl border border-pitch-border bg-pitch-card p-6">
        <TeamBadge team={team} size={64} />
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{team.name}</h1>
          {team.isExternal ? (
            <p className="text-sm text-slate-400">
              {team.league} · calendario en vivo vía football-data.org
              {realSquad
                ? " · plantilla y lesiones vía API-Football"
                : " · plantilla y mercado no disponibles para este club en el dataset de demostración"}
              . Sin valor de mercado (esa métrica solo la calcula Transfermarkt, no hay API gratuita).
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
            {squad.length > 0 ? (
              <div className="grid gap-1 sm:grid-cols-2">
                {squad.map((p) => (
                  <PlayerRow key={p.id} player={p} metric={{ label: "Valor", value: `${p.marketValueM}M€` }} />
                ))}
              </div>
            ) : realSquad && realSquad.length > 0 ? (
              <div className="grid gap-1 sm:grid-cols-2">
                {realSquad.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg px-2 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.photo} alt={p.name} className="h-8 w-8 rounded-full bg-white/5 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{p.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {p.position}
                        {p.age ? ` · ${p.age} años` : ""}
                      </p>
                    </div>
                    {p.number && <span className="text-xs font-bold text-slate-500">#{p.number}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Sin jugadores registrados en el dataset.</p>
            )}
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
            {teamTransfers.length > 0 ? (
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
            ) : realTransfers && realTransfers.length > 0 ? (
              <div className="space-y-2">
                {realTransfers.map((t, i) => (
                  <div key={i} className="rounded-lg border border-pitch-border bg-pitch-card p-3 text-sm">
                    <span className="font-medium text-white">{t.playerName}</span>{" "}
                    <span className="text-slate-500">
                      {t.fromClub} → {t.toClub} · {t.type} · {new Date(t.date).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Sin movimientos registrados.</p>
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
            {injuries.length > 0 ? (
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
            ) : realInjuries && realInjuries.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {realInjuries.map((inj, i) => (
                  <li key={i}>
                    <span className="font-medium text-white">{inj.playerName}</span>
                    <p className="text-xs text-slate-500">{inj.reason}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Sin lesionados registrados.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
