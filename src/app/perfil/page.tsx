import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserStats } from "@/lib/predictions";
import { getLedger } from "@/lib/footcoins";
import { DailyClaimButton } from "@/components/DailyClaimButton";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata = { title: "Mi perfil — FootVision" };

interface LedgerRow {
  id: number;
  amount: number;
  reason: string;
  created_at: string;
}

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const stats = getUserStats(user.id);
  const ledger = getLedger(user.id, 15) as LedgerRow[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between rounded-2xl border border-pitch-border bg-pitch-card p-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{user.display_name}</h1>
          <p className="text-sm text-slate-400">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["FootCoins", stats.footcoins],
          ["Racha de login", stats.loginStreak],
          ["Racha de aciertos", stats.currentStreak],
          ["Precisión", `${stats.accuracy}%`],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-pitch-border bg-pitch-card p-4 text-center">
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <DailyClaimButton />

      <section className="rounded-xl border border-pitch-border bg-pitch-card p-5">
        <h2 className="mb-3 font-display text-lg font-bold text-white">Historial de FootCoins</h2>
        {ledger.length === 0 ? (
          <p className="text-sm text-slate-500">Sin movimientos todavía.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {ledger.map((row) => (
              <li key={row.id} className="flex items-center justify-between border-b border-pitch-border pb-2">
                <span className="text-slate-300">{row.reason}</span>
                <span className={row.amount >= 0 ? "font-semibold text-accent" : "font-semibold text-red-400"}>
                  {row.amount >= 0 ? "+" : ""}
                  {row.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
