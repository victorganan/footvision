import { isRealDataEnabled, isUsingRealMatches, REAL_DATA_LEAGUES } from "@/lib/football-data";

export async function RealDataBanner() {
  if (!isRealDataEnabled()) return null;

  const isReal = await isUsingRealMatches();

  if (isReal) {
    return (
      <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-xs text-slate-300">
        <span className="font-semibold text-accent">Datos en vivo:</span> partidos y clasificaciones
        reales de {REAL_DATA_LEAGUES.join(", ")} vía football-data.org (plan gratuito). El resto de
        la información — jugadores, valor de mercado, plantillas, mercado de fichajes y el Centro de
        Ojeo — sigue siendo un dataset de demostración.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-slate-300">
      <span className="font-semibold text-amber-400">Aviso:</span> hay una clave de football-data.org
      configurada, pero ahora mismo no se ha podido traer ningún partido real (puede ser un fallo
      temporal de la API, el límite de peticiones, o que no haya partidos de{" "}
      {REAL_DATA_LEAGUES.join(", ")} en este rango de fechas). Se están mostrando partidos de
      ejemplo. Consulta <code className="text-slate-400">/api/debug/estado</code> para ver el detalle.
    </div>
  );
}
