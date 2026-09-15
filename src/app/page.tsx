import Link from "next/link";
import {
  getFinishedMatches,
  getLiveMatches,
  getNews,
  getOfficialTransfers,
  getPlayerById,
  getTeamById,
  getUpcomingMatches,
} from "@/lib/football-data";
import { MatchCard } from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { AdSlot } from "@/components/AdSlot";
import { TeamBadge } from "@/components/TeamBadge";

export default function HomePage() {
  const live = getLiveMatches();
  const upcoming = getUpcomingMatches(4);
  const finished = getFinishedMatches(4);
  const news = getNews(5);
  const transfers = getOfficialTransfers();

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-pitch-border bg-gradient-to-br from-pitch-card to-pitch p-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">
          Inteligencia futbolística en tiempo real
        </p>
        <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
          Analiza el fútbol como un director deportivo
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Partidos en directo, fichas de jugadores y equipos, mercado de fichajes, un Centro de Ojeo
          con IA y predicciones gamificadas con FootCoins. Todo en un solo sitio.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/ojeo" className="rounded-lg bg-accent px-4 py-2 font-semibold text-pitch hover:bg-accent-dark">
            Probar el Centro de Ojeo
          </Link>
          <Link href="/predicciones" className="rounded-lg border border-pitch-border px-4 py-2 font-semibold text-white hover:bg-pitch-card">
            Hacer una predicción
          </Link>
        </div>
      </section>

      {live.length > 0 && (
        <section>
          <SectionHeader title="Partidos en directo" href="/partidos" />
          <div className="grid gap-4 md:grid-cols-2">
            {live.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <SectionHeader title="Próximos partidos" href="/partidos" />
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>

          <AdSlot className="h-24 w-full" />

          <section>
            <SectionHeader title="Últimos resultados" href="/partidos" />
            <div className="grid gap-4 md:grid-cols-2">
              {finished.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <SectionHeader title="Noticias importantes" />
            <div className="space-y-3">
              {news.map((item) => (
                <article key={item.id} className="rounded-lg border border-pitch-border bg-pitch-card p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">{item.category}</span>
                  <h3 className="mt-1 text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{item.summary}</p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Fichajes del día" href="/mercado" />
            <div className="space-y-2">
              {transfers.map((t) => {
                const player = getPlayerById(t.playerId);
                const toTeam = getTeamById(t.toTeamId);
                const fromTeam = getTeamById(t.fromTeamId);
                if (!player || !toTeam || !fromTeam) return null;
                return (
                  <div key={t.id} className="flex items-center gap-2 rounded-lg border border-pitch-border bg-pitch-card p-3 text-sm">
                    <TeamBadge team={fromTeam} size={20} />
                    <span className="text-slate-500">→</span>
                    <TeamBadge team={toTeam} size={20} />
                    <div className="ml-1 min-w-0 flex-1">
                      <p className="truncate font-medium text-white">{player.name}</p>
                      <p className="text-xs text-slate-500">{t.feeEstimateM ? `${t.feeEstimateM}M€` : "Libre"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
