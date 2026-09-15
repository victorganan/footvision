import { isRealDataEnabled, REAL_DATA_LEAGUES } from "@/lib/football-data";

export function RealDataBanner() {
  if (!isRealDataEnabled()) return null;

  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-xs text-slate-300">
      <span className="font-semibold text-accent">Datos en vivo:</span> partidos y clasificaciones
      reales de {REAL_DATA_LEAGUES.join(", ")} vía football-data.org (plan gratuito). El resto de
      la información — jugadores, valor de mercado, plantillas, mercado de fichajes y el Centro de
      Ojeo — sigue siendo un dataset de demostración.
    </div>
  );
}
