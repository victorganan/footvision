import Link from "next/link";
import { getTeamById } from "@/lib/football-data";
import type { Match } from "@/lib/types";
import { TeamBadge } from "./TeamBadge";

function formatKickoff(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("es-ES", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function MatchCard({ match }: { match: Match }) {
  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  if (!home || !away) return null;

  return (
    <Link
      href={`/partidos/${match.id}`}
      className="block rounded-xl border border-pitch-border bg-pitch-card p-4 transition hover:border-accent/50 hover:bg-pitch-card/80"
    >
      <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
        <span>{match.league} · {match.round}</span>
        {match.status === "live" ? (
          <span className="flex items-center gap-1 font-semibold text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            EN VIVO {match.minute}&apos;
          </span>
        ) : match.status === "finished" ? (
          <span className="text-slate-500">Finalizado</span>
        ) : (
          <span>{formatKickoff(match.kickoff)}</span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-2">
          <TeamBadge team={home} />
          <span className="truncate text-sm font-medium text-white">{home.shortName}</span>
        </div>

        <div className="min-w-[64px] text-center">
          {match.status === "scheduled" ? (
            <span className="text-sm font-semibold text-slate-400">VS</span>
          ) : (
            <span className="font-display text-xl font-bold text-white">
              {match.homeScore} - {match.awayScore}
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 text-right">
          <span className="truncate text-sm font-medium text-white">{away.shortName}</span>
          <TeamBadge team={away} />
        </div>
      </div>
    </Link>
  );
}
