import { getPlayers } from "@/lib/football-data";
import { PlayerRow } from "@/components/PlayerRow";
import Link from "next/link";

export const metadata = { title: "Jugadores — FootVision" };

export default function JugadoresPage() {
  const players = [...getPlayers()].sort((a, b) => b.marketValueM - a.marketValueM);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Jugadores</h1>
        <Link href="/ojeo" className="text-sm font-medium text-accent hover:underline">
          Ir al Centro de Ojeo →
        </Link>
      </div>
      <div className="grid gap-1 sm:grid-cols-2">
        {players.map((p) => (
          <PlayerRow key={p.id} player={p} metric={{ label: "Valor", value: `${p.marketValueM}M€` }} />
        ))}
      </div>
    </div>
  );
}
