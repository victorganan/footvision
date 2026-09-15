# Changelog

## 2026-09-15 — Plantilla, lesiones y fichajes reales (API-Football)

- Conector real con API-Football (`src/lib/api-football.ts`), activable con `API_FOOTBALL_KEY`.
- Los clubes "externos" (aparecen en partidos reales pero no en el dataset curado) muestran ahora plantilla completa, lesiones y últimos fichajes reales en su ficha de equipo. Los ~10 clubes curados mantienen su ficha simulada enriquecida sin cambios.
- No cubre valor de mercado (ninguna API gratuita lo ofrece); documentado en README junto con el resto de limitaciones.
- Cache en memoria por club (plantilla 12h, lesiones 6h, fichajes 24h) para respetar el límite de 100 peticiones/día del plan gratuito.

## 2026-09-15 — Partidos y clasificaciones reales (football-data.org)

- Conector real con football-data.org (`src/lib/football-data-real.ts`) para Partidos y Clasificación, activable con `FOOTBALL_DATA_API_KEY`. Cubre LaLiga, Premier League, Bundesliga, Ligue 1 y Serie A (plan gratuito).
- Cache en memoria para respetar el límite de 10 peticiones/minuto del plan gratuito, y fallback automático al dataset simulado si la API falla.
- Aviso visible en Home y Resultados (`RealDataBanner`) indicando qué ligas tienen datos reales y qué secciones siguen siendo un dataset de demostración (jugadores, mercado, valor de mercado, Centro de Ojeo).
- Equipos que no están en nuestro dataset simulado obtienen una ficha básica con calendario real pero sin plantilla, en vez de romper la página.
- `getMatches`, `getMatchById`, `getMatchesByTeam` y `getStandings` pasan a ser funciones asíncronas en toda la app (páginas y rutas API actualizadas).

## 2026-09-15 — MVP inicial

Primera versión funcional de FootVision según el master prompt (sección 7,
MVP obligatorio):

- Base del proyecto: Next.js 15 + TypeScript + Tailwind CSS, SQLite embebido.
- Dataset deportivo simulado (equipos, jugadores, partidos, mercado, noticias) servido a través de una capa de acceso a datos (`src/lib/football-data.ts`) preparada para sustituirse por una API real gratuita.
- Sistema de usuarios: registro, login, cookies de sesión firmadas.
- Sistema de FootCoins: bono de bienvenida, bono de login diario con racha, ledger de movimientos.
- Predicciones de partidos: pick 1X2 gratuito (+1 FootCoin), apuesta opcional a doble o nada, bonus de racha de 5 aciertos (+5).
- Home, Resultados (en directo/próximos/finalizados), ficha de partido (estadísticas, cronología, goleadores, tarjetas, cambios, alineaciones).
- Fichas de equipo (plantilla, calendario, clasificación, mercado, lesiones) y de jugador (estadísticas, historial de fichajes, comparador rápido, predicción IA de próximo club).
- Mercado: rumores por probabilidad, fichajes oficiales, libres, contratos que expiran.
- Centro de Ojeo: búsqueda gratuita por filtros y lenguaje natural, informe profesional generado por IA (OpenAI si hay API key, heurística local si no) por 5 FootCoins.
- Espacios publicitarios de Google AdSense listos para activarse con `NEXT_PUBLIC_ADSENSE_CLIENT_ID`.
- Documentación de despliegue en servidor Cloud de ARSYS.

Pendiente para siguientes iteraciones: Career Tracker, comparador visual
avanzado, rankings y desafíos, IA premium conversacional, suscripción Pro
con Stripe, conexión a una fuente de datos deportivos real.
