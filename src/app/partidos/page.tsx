import { getFinishedMatches, getLiveMatches, getUpcomingMatches } from "@/lib/football-data";
import { MatchCard } from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { RealDataBanner } from "@/components/RealDataBanner";

export const metadata = { title: "Resultados y partidos — FootVision" };

export default async function PartidosPage() {
  const [live, upcoming, finished] = await Promise.all([
    getLiveMatches(),
    getUpcomingMatches(),
    getFinishedMatches(),
  ]);

  return (
    <div className="space-y-10">
      <h1 className="font-display text-2xl font-bold text-white">Resultados</h1>

      <RealDataBanner />

      {live.length > 0 && (
        <section>
          <SectionHeader title="En directo" />
          <div className="grid gap-4 md:grid-cols-2">
            {live.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Próximos partidos" />
        <div className="grid gap-4 md:grid-cols-2">
          {upcoming.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Resultados recientes" />
        <div className="grid gap-4 md:grid-cols-2">
          {finished.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>
    </div>
  );
}
