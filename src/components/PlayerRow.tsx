import Link from "next/link";
import { getTeamById } from "@/lib/football-data";
import type { Player } from "@/lib/types";
import { TeamBadge } from "./TeamBadge";

export function PlayerRow({ player, metric }: { player: Player; metric?: { label: string; value: string | number } }) {
  const team = player.teamId ? getTeamById(player.teamId) : undefined;

  return (
    <Link
      href={`/jugadores/${player.slug}`}
      className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition hover:border-pitch-border hover:bg-pitch-card"
    >
      {team ? <TeamBadge team={team} size={24} /> : <span className="h-6 w-6 rounded-full bg-pitch-border" />}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{player.name}</p>
        <p className="truncate text-xs text-slate-500">
          {team?.name ?? "Agente libre"} · {player.position}
        </p>
      </div>
      {metric && (
        <div className="text-right">
          <p className="text-sm font-bold text-accent">{metric.value}</p>
          <p className="text-[10px] uppercase text-slate-500">{metric.label}</p>
        </div>
      )}
    </Link>
  );
}
