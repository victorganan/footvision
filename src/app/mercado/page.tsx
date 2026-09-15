import Link from "next/link";
import {
  getExpiringContracts,
  getFreeAgents,
  getOfficialTransfers,
  getPlayerById,
  getRumors,
  getTeamById,
} from "@/lib/football-data";
import { TeamBadge } from "@/components/TeamBadge";
import { AdSlot } from "@/components/AdSlot";

export const metadata = { title: "Mercado de fichajes — FootVision" };

export default function MercadoPage() {
  const rumors = getRumors();
  const official = getOfficialTransfers();
  const freeAgents = getFreeAgents();
  const expiring = getExpiringContracts();

  return (
    <div className="space-y-10">
      <h1 className="font-display text-2xl font-bold text-white">Mercado</h1>

      <section>
        <h2 className="mb-4 font-display text-lg font-bold text-white">Rumores (por probabilidad)</h2>
        <div className="space-y-2">
          {rumors.map((r) => {
            const player = getPlayerById(r.playerId);
            const from = getTeamById(r.fromTeamId);
            const to = getTeamById(r.toTeamId);
            if (!player || !from || !to) return null;
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-lg border border-pitch-border bg-pitch-card p-3">
                <Link href={`/jugadores/${player.slug}`} className="min-w-[140px] font-medium text-white hover:underline">
                  {player.name}
                </Link>
                <TeamBadge team={from} size={20} />
                <span className="text-slate-500">→</span>
                <TeamBadge team={to} size={20} />
                <span className="text-sm text-slate-400">{to.name}</span>
                <div className="ml-auto flex items-center gap-2">
                  {r.feeEstimateM && <span className="text-xs text-slate-500">{r.feeEstimateM}M€</span>}
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{r.probability}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <AdSlot className="h-20 w-full" />

      <section>
        <h2 className="mb-4 font-display text-lg font-bold text-white">Fichajes oficiales</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {official.map((t) => {
            const player = getPlayerById(t.playerId);
            const from = getTeamById(t.fromTeamId);
            const to = getTeamById(t.toTeamId);
            if (!player || !from || !to) return null;
            return (
              <div key={t.id} className="flex items-center gap-2 rounded-lg border border-pitch-border bg-pitch-card p-3 text-sm">
                <TeamBadge team={from} size={20} />
                <span className="text-slate-500">→</span>
                <TeamBadge team={to} size={20} />
                <span className="ml-1 font-medium text-white">{player.name}</span>
                <span className="ml-auto text-slate-500">{t.feeEstimateM ? `${t.feeEstimateM}M€` : "Libre"}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Jugadores libres</h2>
          <div className="space-y-2">
            {freeAgents.map((t) => {
              const player = getPlayerById(t.playerId);
              if (!player) return null;
              return (
                <Link
                  key={t.id}
                  href={`/jugadores/${player.slug}`}
                  className="block rounded-lg border border-pitch-border bg-pitch-card p-3 text-sm text-white hover:border-accent/50"
                >
                  {player.name} · {player.position} · {player.age} años
                </Link>
              );
            })}
            {freeAgents.length === 0 && <p className="text-sm text-slate-500">Sin agentes libres destacados.</p>}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Terminan contrato</h2>
          <div className="space-y-2">
            {expiring.map((t) => {
              const player = getPlayerById(t.playerId);
              if (!player) return null;
              return (
                <Link
                  key={t.id}
                  href={`/jugadores/${player.slug}`}
                  className="block rounded-lg border border-pitch-border bg-pitch-card p-3 text-sm text-white hover:border-accent/50"
                >
                  {player.name} · contrato hasta {player.contractUntil}
                </Link>
              );
            })}
            {expiring.length === 0 && <p className="text-sm text-slate-500">Sin contratos próximos a vencer.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
