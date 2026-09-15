import teamsJson from "@/data/teams.json";
import type { Match, MatchEvent, Team } from "./types";

/**
 * Conector real con football-data.org (plan gratuito).
 *
 * Cubre SOLO partidos y clasificaciones de las ligas del plan gratuito que
 * ya modelamos en el dataset simulado. Jugadores, valor de mercado, plantillas
 * completas, lesiones y mercado de fichajes NO están disponibles en el plan
 * gratuito de esta API, así que esas secciones siguen usando el dataset
 * simulado de src/data aunque este conector esté activo.
 */
const API_BASE = "https://api.football-data.org/v4";

const LEAGUE_CODES: Record<string, string> = {
  LaLiga: "PD",
  "Premier League": "PL",
  Bundesliga: "BL1",
  "Ligue 1": "FL1",
  "Serie A": "SA",
};
const CODE_TO_LEAGUE: Record<string, string> = Object.fromEntries(
  Object.entries(LEAGUE_CODES).map(([league, code]) => [code, league])
);
const SUPPORTED_CODES = Object.values(LEAGUE_CODES);
export const SUPPORTED_LEAGUES = Object.keys(LEAGUE_CODES);

export function isRealDataEnabled(): boolean {
  return Boolean(process.env.FOOTBALL_DATA_API_KEY);
}

// ---------------------------------------------------------------------------
// Cache en memoria muy simple: el plan gratuito permite 10 peticiones/minuto,
// así que cacheamos agresivamente. Si una petición falla (limite alcanzado,
// red caída...) se sirve la última respuesta buena conocida antes que romper
// la pagina.
// ---------------------------------------------------------------------------
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry<unknown>>();

async function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expiresAt > Date.now()) return hit.value;
  try {
    const value = await fetcher();
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  } catch (err) {
    if (hit) return hit.value;
    throw err;
  }
}

async function fetchFD<T>(path: string): Promise<T> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "X-Auth-Token": apiKey as string },
  });
  if (!res.ok) {
    throw new Error(`football-data.org respondió ${res.status} en ${path}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Emparejar equipos reales con nuestro dataset simulado (por nombre), para
// que un club que ya tenemos modelado (plantilla, mercado...) muestre esos
// datos aunque el partido venga de la API real.
// ---------------------------------------------------------------------------
function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b(cf|fc|sad|club|de|futbol|calcio|ac|the|athletic)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

const mockTeams = teamsJson as Team[];
const mockByNormalizedName = new Map<string, Team>();
for (const t of mockTeams) {
  mockByNormalizedName.set(normalize(t.name), t);
  mockByNormalizedName.set(normalize(t.shortName), t);
}

interface ApiTeamRef {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
}

function matchMockTeam(apiTeam: ApiTeamRef): Team | undefined {
  return (
    mockByNormalizedName.get(normalize(apiTeam.name)) ||
    (apiTeam.shortName ? mockByNormalizedName.get(normalize(apiTeam.shortName)) : undefined) ||
    (apiTeam.tla ? mockByNormalizedName.get(normalize(apiTeam.tla)) : undefined)
  );
}

// Equipos reales sin ficha propia en el dataset simulado: se registran aquí
// "al vuelo" para que sus fichas y enlaces funcionen (con plantilla vacía).
const externalTeamRegistry = new Map<string, Team>();

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveTeam(apiTeam: ApiTeamRef, league: string): Team {
  const mock = matchMockTeam(apiTeam);
  if (mock) return mock;

  const id = `fd-${apiTeam.id}`;
  const existing = externalTeamRegistry.get(id);
  if (existing) return existing;

  const team: Team = {
    id,
    name: apiTeam.name,
    shortName: apiTeam.shortName || apiTeam.tla || apiTeam.name,
    slug: slugify(apiTeam.name),
    league,
    country: "—",
    crestColor: "#334155",
    crestUrl: apiTeam.crest,
    founded: 0,
    stadium: "—",
    coach: "—",
    marketValueM: 0,
    isExternal: true,
  };
  externalTeamRegistry.set(id, team);
  return team;
}

export function getExternalTeamById(id: string): Team | undefined {
  return externalTeamRegistry.get(id);
}

export function getExternalTeamBySlug(slug: string): Team | undefined {
  for (const team of externalTeamRegistry.values()) {
    if (team.slug === slug) return team;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Mapeo de partidos
// ---------------------------------------------------------------------------
function mapStatus(apiStatus: string): Match["status"] | null {
  switch (apiStatus) {
    case "SCHEDULED":
    case "TIMED":
      return "scheduled";
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    case "FINISHED":
    case "AWARDED":
      return "finished";
    default:
      // POSTPONED, SUSPENDED, CANCELED: se omiten en este MVP
      return null;
  }
}

interface ApiGoal {
  minute: number | null;
  team?: { id: number };
  scorer?: { name?: string };
  assist?: { name?: string };
}
interface ApiBooking {
  minute: number | null;
  team?: { id: number };
  player?: { name?: string };
  card?: string;
}
interface ApiSubstitution {
  minute: number | null;
  team?: { id: number };
  playerIn?: { name?: string };
  playerOut?: { name?: string };
}

interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday?: number;
  stage?: string;
  venue?: string;
  competition?: { code?: string; name?: string };
  homeTeam: ApiTeamRef;
  awayTeam: ApiTeamRef;
  score?: { fullTime?: { home: number | null; away: number | null } };
  goals?: ApiGoal[];
  bookings?: ApiBooking[];
  substitutions?: ApiSubstitution[];
}

function mapMatch(apiMatch: ApiMatch): Match | null {
  const status = mapStatus(apiMatch.status);
  if (!status) return null;

  const league =
    (apiMatch.competition?.code && CODE_TO_LEAGUE[apiMatch.competition.code]) ||
    apiMatch.competition?.name ||
    "Otros";

  const homeTeam = resolveTeam(apiMatch.homeTeam, league);
  const awayTeam = resolveTeam(apiMatch.awayTeam, league);

  const events: MatchEvent[] = [];
  for (const g of apiMatch.goals ?? []) {
    events.push({
      minute: g.minute ?? 0,
      type: "goal",
      team: g.team?.id === apiMatch.homeTeam.id ? "home" : "away",
      description: `Gol de ${g.scorer?.name ?? "jugador"}${g.assist?.name ? `, asistencia de ${g.assist.name}` : ""}`,
    });
  }
  for (const b of apiMatch.bookings ?? []) {
    const isRed = b.card === "RED_CARD" || b.card === "SECOND_YELLOW_CARD";
    events.push({
      minute: b.minute ?? 0,
      type: isRed ? "red" : "yellow",
      team: b.team?.id === apiMatch.homeTeam.id ? "home" : "away",
      description: `Tarjeta ${isRed ? "roja" : "amarilla"} a ${b.player?.name ?? "jugador"}`,
    });
  }
  for (const s of apiMatch.substitutions ?? []) {
    events.push({
      minute: s.minute ?? 0,
      type: "sub",
      team: s.team?.id === apiMatch.homeTeam.id ? "home" : "away",
      description: `Entra ${s.playerIn?.name ?? "?"}, sale ${s.playerOut?.name ?? "?"}`,
    });
  }
  events.sort((a, b) => a.minute - b.minute);

  return {
    id: `fd-m-${apiMatch.id}`,
    league,
    round: apiMatch.matchday ? `Jornada ${apiMatch.matchday}` : apiMatch.stage ?? "",
    kickoff: apiMatch.utcDate,
    status,
    // El plan gratuito de football-data.org no expone el minuto en vivo de forma fiable.
    minute: undefined,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeScore: apiMatch.score?.fullTime?.home ?? null,
    awayScore: apiMatch.score?.fullTime?.away ?? null,
    venue: apiMatch.venue ?? "—",
    events,
    // El plan gratuito no incluye posesión, tiros, xG ni córners.
    stats: null,
  };
}

const MATCH_LIST_TTL = 3 * 60 * 1000;
const MATCH_DETAIL_TTL = 2 * 60 * 1000;
const STANDINGS_TTL = 10 * 60 * 1000;

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getRealMatches(): Promise<Match[]> {
  if (!isRealDataEnabled()) return [];
  return cached("matches-list", MATCH_LIST_TTL, async () => {
    const from = new Date(Date.now() - 4 * 86_400_000);
    const to = new Date(Date.now() + 12 * 86_400_000);
    const data = await fetchFD<{ matches: ApiMatch[] }>(
      `/matches?competitions=${SUPPORTED_CODES.join(",")}&dateFrom=${dateStr(from)}&dateTo=${dateStr(to)}`
    );
    const matches: Match[] = [];
    for (const apiMatch of data.matches ?? []) {
      const mapped = mapMatch(apiMatch);
      if (mapped) matches.push(mapped);
    }
    return matches;
  });
}

export async function getRealMatchById(id: string): Promise<Match | undefined> {
  if (!isRealDataEnabled() || !id.startsWith("fd-m-")) return undefined;
  const apiId = id.replace("fd-m-", "");
  return cached(`match-${apiId}`, MATCH_DETAIL_TTL, async () => {
    const data = await fetchFD<ApiMatch>(`/matches/${apiId}`);
    return mapMatch(data) ?? undefined;
  });
}

interface ApiStandingRow {
  team: ApiTeamRef;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface StandingRow {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  points: number;
}

export async function getRealStandings(league: string): Promise<StandingRow[] | null> {
  if (!isRealDataEnabled()) return null;
  const code = LEAGUE_CODES[league];
  if (!code) return null;

  return cached(`standings-${code}`, STANDINGS_TTL, async () => {
    const data = await fetchFD<{ standings: { type: string; table: ApiStandingRow[] }[] }>(
      `/competitions/${code}/standings`
    );
    const table = data.standings?.find((s) => s.type === "TOTAL")?.table ?? [];
    return table.map((row) => {
      const team = resolveTeam(row.team, league);
      return {
        teamId: team.id,
        played: row.playedGames,
        wins: row.won,
        draws: row.draw,
        losses: row.lost,
        gf: row.goalsFor,
        ga: row.goalsAgainst,
        points: row.points,
      };
    });
  });
}
