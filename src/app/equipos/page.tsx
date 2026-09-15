import Link from "next/link";
import { getTeams } from "@/lib/football-data";
import { TeamBadge } from "@/components/TeamBadge";

export const metadata = { title: "Equipos — FootVision" };

export default function EquiposPage() {
  const teams = getTeams();
  const byLeague = new Map<string, typeof teams>();
  for (const team of teams) {
    byLeague.set(team.league, [...(byLeague.get(team.league) ?? []), team]);
  }

  return (
    <div className="space-y-10">
      <h1 className="font-display text-2xl font-bold text-white">Equipos</h1>
      {Array.from(byLeague.entries()).map(([league, list]) => (
        <section key={league}>
          <h2 className="mb-4 font-display text-lg font-bold text-white">{league}</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {list.map((team) => (
              <Link
                key={team.id}
                href={`/equipos/${team.slug}`}
                className="flex items-center gap-3 rounded-xl border border-pitch-border bg-pitch-card p-4 transition hover:border-accent/50"
              >
                <TeamBadge team={team} size={40} />
                <div>
                  <p className="font-semibold text-white">{team.name}</p>
                  <p className="text-xs text-slate-500">{team.country} · {team.marketValueM}M€</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
