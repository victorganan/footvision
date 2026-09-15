# FootVision

Plataforma de inteligencia futbolística: resultados en directo, fichas de
jugadores y equipos, mercado de fichajes, un Centro de Ojeo con IA y
predicciones gamificadas con FootCoins. Monetizable con Google AdSense.

Este repositorio contiene el **MVP** descrito en el master prompt del
proyecto (sección 7): la base funcional sobre la que crecer hacia la visión
completa (Career Tracker, comparador avanzado, rankings, IA premium, Stripe...).

## Stack técnico

Elegido para poder desplegarse en un servidor de ARSYS sin depender de
servicios externos de pago (ver sección de despliegue):

- **Next.js 15 (App Router) + TypeScript + Tailwind CSS** — frontend y API en un solo proceso Node.
- **SQLite (better-sqlite3)** — usuarios, FootCoins, predicciones e informes. Un único fichero, sin servidor de base de datos aparte.
- **Datos deportivos**: dataset simulado en `src/data/*.json`, servido a través de `src/lib/football-data.ts`. Ese módulo es el punto de extensión para conectar una fuente real y gratuita (football-data.org, API-Football...) sin tocar el resto de la app.
- **IA de scouting**: `src/lib/scouting.ts` usa la API de OpenAI si hay `OPENAI_API_KEY` configurada; si no, genera el informe con una heurística local (gratis, siempre disponible).

## Funcionalidades del MVP

1. Home con partidos en directo, próximos, resultados, noticias y fichajes del día.
2. Sistema de usuarios (registro/login por email y contraseña, cookies firmadas).
3. Predicciones de partidos con FootCoins (acierto gratuito +1, apuesta opcional a doble o nada, racha de 5 aciertos +5).
4. Fichas de jugadores (estadísticas, historial de fichajes, valor de mercado, comparador rápido, predicción IA de próximo club).
5. Fichas de equipos (plantilla, calendario, clasificación, mercado, lesiones).
6. Centro de Ojeo: filtros + lenguaje natural, búsqueda gratuita, informe profesional con IA (5 FootCoins).
7. Mercado: rumores por probabilidad, fichajes oficiales, libres, contratos que expiran.
8. Espacios publicitarios de Google AdSense (se activan solo con `NEXT_PUBLIC_ADSENSE_CLIENT_ID` configurado).

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # opcional, funciona sin rellenar nada
npm run dev
```

La base de datos SQLite se crea sola en `data/footvision.db` la primera vez
que se usa (registro, predicción, etc.). No requiere instalación aparte.

## Variables de entorno

Ver `.env.example`. Todas son opcionales salvo `SESSION_SECRET` en
producción:

| Variable | Para qué sirve | Si no se define |
|---|---|---|
| `SESSION_SECRET` | Firma las cookies de sesión | Usa un valor de desarrollo (cámbialo en producción) |
| `OPENAI_API_KEY` | Informes del Centro de Ojeo redactados por IA | Se usa un generador heurístico local (sin coste) |
| `FOOTBALL_DATA_API_KEY` / `FOOTBALL_DATA_PROVIDER` | Conectar una fuente real de datos deportivos | Se sirve el dataset simulado de `src/data` |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Activar los espacios de Google AdSense | Se muestran placeholders sin anuncios reales |

## Despliegue en ARSYS

Next.js necesita un **proceso Node.js persistente** (SSR + rutas API +
lectura/escritura de la base SQLite), algo que los planes de "Hosting"
clásico de ARSYS (cPanel/Plesk, pensados para PHP estático) no ofrecen. La
opción compatible dentro de ARSYS es un **Servidor Cloud / VPS Cloud**
(Linux, con acceso root), que sigue siendo la opción económica de ARSYS y
te da control total.

Pasos orientativos sobre un VPS Cloud de ARSYS (Ubuntu/Debian):

```bash
# 1. Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# 2. Clonar y construir
git clone <tu-repo> footvision && cd footvision
npm install
cp .env.example .env.local   # y rellena SESSION_SECRET, OPENAI_API_KEY, etc.
npm run build

# 3. Proceso persistente con PM2
sudo npm install -g pm2
pm2 start npm --name footvision -- start
pm2 save
pm2 startup   # deja el servicio arrancando con el sistema

# 4. Nginx como proxy inverso hacia el puerto 3000 + certificado TLS (Let's Encrypt / certbot)
```

Notas:

- El fichero `data/footvision.db` debe vivir en disco persistente del VPS (no en un directorio temporal) y conviene incluirlo en la copia de seguridad periódica del servidor.
- Si en el futuro el tráfico lo justifica, `football-data.ts` y la base SQLite son los dos puntos a migrar primero (API de datos real + PostgreSQL gestionado), sin tener que rehacer el resto de la aplicación.
- Para AdSense: solicita la revisión del sitio ya desplegado con su dominio real, y una vez aprobado sustituye el `pub-0000000000000000` de `public/ads.txt` y define `NEXT_PUBLIC_ADSENSE_CLIENT_ID`.

## Estructura del proyecto

```
src/
  app/            Páginas (App Router) y rutas API
  components/     Componentes de UI reutilizables
  lib/            Lógica de negocio: auth, footcoins, predicciones, scouting, datos deportivos
  data/           Dataset simulado (equipos, jugadores, partidos, mercado, noticias)
docs/
  changelog.md    Historial de cambios de producto
```

## Próximos pasos (fuera del MVP)

Descritos en el master prompt como evolución natural del producto:
Career Tracker, comparador visual avanzado (radar de atributos), rankings
de predicciones (semanal/mensual/por países/amigos), desafíos y niveles,
IA premium conversacional, suscripción FootVision Pro y pagos con Stripe,
y sustitución del dataset simulado por una fuente de datos deportivos real.
