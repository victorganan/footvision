import { getPlayerById } from "@/lib/football-data";
import { ScoutingSearch } from "@/components/ScoutingSearch";
import { ScoutingReportButton } from "@/components/ScoutingReportButton";
import { AdSlot } from "@/components/AdSlot";

export const metadata = { title: "Centro de Ojeo — FootVision" };

export default async function OjeoPage({
  searchParams,
}: {
  searchParams: Promise<{ playerId?: string }>;
}) {
  const { playerId } = await searchParams;
  const preselected = playerId ? getPlayerById(playerId) : undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Centro de Ojeo</h1>
        <p className="mt-1 text-sm text-slate-400">
          Filtra jugadores como un director deportivo. La búsqueda es gratuita; el informe
          profesional con IA cuesta FootCoins.
        </p>
      </div>

      {preselected && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-sm text-slate-300">
            Jugador seleccionado: <span className="font-semibold text-white">{preselected.name}</span>
          </p>
          <ScoutingReportButton playerId={preselected.id} playerName={preselected.name} />
        </div>
      )}

      <ScoutingSearch />

      <AdSlot className="h-20 w-full" />
    </div>
  );
}
