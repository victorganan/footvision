# Changelog

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
