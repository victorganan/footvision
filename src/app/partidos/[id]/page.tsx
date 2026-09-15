import { notFound } from "next/navigation";
import Link from "next/link";
import { getMatchById, getPlayerById, getTeamById } from "@/lib/football-data";
import { TeamBadge } from "@/components/TeamBadge";
import { StatBar } from "@/components/StatBar";
import { AdSlot } from "@/components/AdSlot";

const EVENT_ICON: Record<string, string> = {
  goal: "⚽",
  yellow: "🟨",
  red: "🟥",
  sub: "🔁",
  var: "📺",
};

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = getMatchById(id);
  if (!match) notFound();

  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  if (!home || !away) notFound();

  const scorers = match.events.filter((e) => e.type === "goal");
  const cards = match.events.filter((e) => e.type === "yellow" || e.type === "red");
  const subs = match.events.filter((e) => e.type === "sub");

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-pitch-border bg-pitch-card p-6">
        <p className="mb-4 text-center text-xs text-slate-400">
          {match.league} · {match.round} · {match.venue}
        </p>
        <div className="grid grid-cols-3 items-center gap-4">
          <Link href={`/equipos/${home.slug}`} className="flex flex-col items-center gap-2 text-center">
            <TeamBadge team={home} size={56} />
            <span className="font-semibold text-white">{home.name}</span>
          </Link>

          <div className="text-center">
            {match.status === "scheduled" ? (
              <>
                <p className="font-display text-3xl font-bold text-white">VS</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(match.kickoff).toLocaleString("es-ES")}</p>
                <Link href="/predicciones" className="mt-3 inline-block rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-pitch">
                  Predecir resultado
                </Link>
              </>
            ) : (
              <>
                <p className="font-display text-5xl font-bold text-white">
                  {match.homeScore} - {match.awayScore}
                </p>
                {match.status === "live" ? (
                  <p className="mt-1 text-sm font-semibold text-accent">EN VIVO · {match.minute}&apos;</p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">Finalizado</p>
                )}
              </>
            )}
          </div>

          <Link href={`/equipos/${away.slug}`} className="flex flex-col items-center gap-2 text-center">
            <TeamBadge team={away} size={56} />
            <span className="font-semibold text-white">{away.name}</span>
          </Link>
        </div>
      </div>

      <AdSlot className="h-20 w-full" />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {match.stats && (
            <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
              <h2 className="mb-4 font-display text-lg font-bold text-white">Estadísticas del partido</h2>
              <StatBar label="Posesión %" home={match.stats.possession[0]} away={match.stats.possession[1]} />
              <StatBar label="Tiros" home={match.stats.shots[0]} away={match.stats.shots[1]} />
              <StatBar label="Tiros a puerta" home={match.stats.shotsOnTarget[0]} away={match.stats.shotsOnTarget[1]} />
              <StatBar label="xG" home={match.stats.xg[0]} away={match.stats.xg[1]} />
              <StatBar label="Córners" home={match.stats.corners[0]} away={match.stats.corners[1]} />
              <StatBar label="Faltas" home={match.stats.fouls[0]} away={match.stats.fouls[1]} />
              <StatBar label="Tarjetas" home={match.stats.cards[0]} away={match.stats.cards[1]} />
            </section>
          )}

          <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
            <h2 className="mb-4 font-display text-lg font-bold text-white">Cronología</h2>
            {match.events.length === 0 ? (
              <p className="text-sm text-slate-500">Aún no hay eventos registrados.</p>
            ) : (
              <ol className="space-y-3 border-l border-pitch-border pl-4">
                {match.events.map((event, i) => (
                  <li key={i} className="relative text-sm">
                    <span className="absolute -left-[21px] grid h-4 w-4 place-items-center rounded-full bg-pitch-card text-[10px]">
                      {EVENT_ICON[event.type]}
                    </span>
                    <span className="font-semibold text-white">{event.minute}&apos;</span>{" "}
                    <span className="text-slate-300">{event.description}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
            <h2 className="mb-3 font-display text-base font-bold text-white">Goleadores</h2>
            {scorers.length === 0 ? (
              <p className="text-sm text-slate-500">Sin goles todavía.</p>
            ) : (
              <ul className="space-y-1 text-sm text-slate-300">
                {scorers.map((e, i) => (
                  <li key={i}>⚽ {e.minute}&apos; — {e.description}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
            <h2 className="mb-3 font-display text-base font-bold text-white">Tarjetas</h2>
            {cards.length === 0 ? (
              <p className="text-sm text-slate-500">Sin tarjetas todavía.</p>
            ) : (
              <ul className="space-y-1 text-sm text-slate-300">
                {cards.map((e, i) => (
                  <li key={i}>{EVENT_ICON[e.type]} {e.minute}&apos; — {e.description}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
            <h2 className="mb-3 font-display text-base font-bold text-white">Cambios</h2>
            {subs.length === 0 ? (
              <p className="text-sm text-slate-500">Sin cambios todavía.</p>
            ) : (
              <ul className="space-y-1 text-sm text-slate-300">
                {subs.map((e, i) => (
                  <li key={i}>🔁 {e.minute}&apos; — {e.description}</li>
                ))}
              </ul>
            )}
          </section>

          {match.lineups && (
            <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
              <h2 className="mb-3 font-display text-base font-bold text-white">Alineaciones destacadas</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="mb-1 text-xs font-semibold text-slate-500">{home.shortName}</p>
                  <ul className="space-y-1 text-slate-300">
                    {match.lineups.home.map((pid) => {
                      const p = getPlayerById(pid);
                      return p ? <li key={pid}>{p.name}</li> : null;
                    })}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold text-slate-500">{away.shortName}</p>
                  <ul className="space-y-1 text-slate-300">
                    {match.lineups.away.map((pid) => {
                      const p = getPlayerById(pid);
                      return p ? <li key={pid}>{p.name}</li> : null;
                    })}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
