import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUpcomingMatches, getTeamById } from "@/lib/football-data";
import { getPredictionForMatch, getUserStats, resolvePendingPredictions } from "@/lib/predictions";
import { TeamBadge } from "@/components/TeamBadge";
import { PredictionForm } from "@/components/PredictionForm";

export const metadata = { title: "Predicciones — FootVision" };

const PICK_LABELS: Record<string, string> = { home: "Local", draw: "Empate", away: "Visitante" };
const STATUS_LABELS: Record<string, string> = { pending: "Pendiente", won: "Acertada", lost: "Fallada" };

export default async function PrediccionesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="rounded-2xl border border-pitch-border bg-pitch-card p-8 text-center">
        <h1 className="font-display text-2xl font-bold text-white">Predicciones</h1>
        <p className="mt-2 text-slate-400">Inicia sesión para predecir partidos y ganar FootCoins.</p>
        <Link href="/login" className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 font-semibold text-pitch">
          Entrar
        </Link>
      </div>
    );
  }

  await resolvePendingPredictions(user.id);
  const stats = getUserStats(user.id);
  const upcoming = await getUpcomingMatches();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Predicciones</h1>
        <p className="mt-1 text-sm text-slate-400">
          Predice gratis y gana +1 FootCoin por acierto. Con saldo, puedes apostar a doble o nada.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["FootCoins", stats.footcoins],
          ["Racha actual", stats.currentStreak],
          ["Precisión", `${stats.accuracy}%`],
          ["Predicciones", stats.totalPredictions],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-pitch-border bg-pitch-card p-4 text-center">
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-white">Próximos partidos</h2>
        {upcoming.map((match) => {
          const home = getTeamById(match.homeTeamId);
          const away = getTeamById(match.awayTeamId);
          const existing = getPredictionForMatch(user.id, match.id);
          if (!home || !away) return null;

          return (
            <div key={match.id} className="rounded-xl border border-pitch-border bg-pitch-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TeamBadge team={home} size={24} />
                  <span className="text-sm font-medium text-white">{home.shortName}</span>
                  <span className="text-xs text-slate-500">vs</span>
                  <span className="text-sm font-medium text-white">{away.shortName}</span>
                  <TeamBadge team={away} size={24} />
                </div>
                <span className="text-xs text-slate-500">{new Date(match.kickoff).toLocaleString("es-ES")}</span>
              </div>

              {existing ? (
                <p className="mt-3 text-sm text-slate-400">
                  Tu predicción: <b className="text-white">{PICK_LABELS[existing.pick]}</b>
                  {existing.stake > 0 && ` · Apuesta: ${existing.stake} 🪙`} ·{" "}
                  <span
                    className={
                      existing.status === "won" ? "text-accent" : existing.status === "lost" ? "text-red-400" : "text-slate-400"
                    }
                  >
                    {STATUS_LABELS[existing.status]}
                  </span>
                </p>
              ) : (
                <PredictionForm matchId={match.id} maxStake={stats.footcoins} />
              )}
            </div>
          );
        })}
        {upcoming.length === 0 && <p className="text-sm text-slate-500">No hay partidos próximos.</p>}
      </section>
    </div>
  );
}
