/**
 * Conector real con API-Football (api-football.com / api-sports.io, plan gratuito).
 *
 * Complementa a football-data-real.ts: aquella trae partidos y clasificaciones;
 * esta trae plantilla completa, lesiones y fichajes recientes de un club.
 *
 * NO da valor de mercado (nadie gratis lo da, solo Transfermarkt lo calcula y
 * no ofrece API). Por eso solo se usa para "equipos externos" — clubes que
 * aparecen en partidos reales pero no están en nuestro dataset curado — para
 * no sustituir la ficha ya enriquecida de los ~10 clubes que sí modelamos a
 * mano (con valor de mercado, historial propio, etc.).
 */
const API_BASE = "https://v3.football.api-sports.io";

export function isSquadDataEnabled(): boolean {
  return Boolean(process.env.API_FOOTBALL_KEY);
}

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

async function fetchAF<T>(path: string): Promise<T> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "x-apisports-key": apiKey as string },
  });
  if (!res.ok) {
    throw new Error(`API-Football respondió ${res.status} en ${path}`);
  }
  return res.json();
}

function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b(cf|fc|sad|club|de|futbol|calcio|ac|the|athletic)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

const POSITION_ES: Record<string, string> = {
  Goalkeeper: "Portero",
  Defender: "Defensa",
  Midfielder: "Centrocampista",
  Attacker: "Delantero",
};

const TEAM_ID_TTL = 24 * 60 * 60 * 1000;
const SQUAD_TTL = 12 * 60 * 60 * 1000;
const INJURIES_TTL = 6 * 60 * 60 * 1000;
const TRANSFERS_TTL = 24 * 60 * 60 * 1000;

interface AFTeamSearchResponse {
  response: { team: { id: number; name: string } }[];
}

async function resolveTeamId(teamName: string): Promise<number | null> {
  if (!isSquadDataEnabled()) return null;
  return cached(`af-team-${normalize(teamName)}`, TEAM_ID_TTL, async () => {
    const data = await fetchAF<AFTeamSearchResponse>(`/teams?search=${encodeURIComponent(teamName)}`);
    const results = data.response ?? [];
    const exact = results.find((r) => normalize(r.team.name) === normalize(teamName));
    return (exact ?? results[0])?.team.id ?? null;
  });
}

export interface RealSquadPlayer {
  id: number;
  name: string;
  age: number | null;
  number: number | null;
  position: string;
  photo: string;
}

interface AFSquadResponse {
  response: { players: { id: number; name: string; age: number | null; number: number | null; position: string; photo: string }[] }[];
}

export async function getRealSquad(teamName: string): Promise<RealSquadPlayer[] | null> {
  if (!isSquadDataEnabled()) return null;
  const teamId = await resolveTeamId(teamName);
  if (!teamId) return null;

  return cached(`af-squad-${teamId}`, SQUAD_TTL, async () => {
    const data = await fetchAF<AFSquadResponse>(`/players/squads?team=${teamId}`);
    const players = data.response?.[0]?.players ?? [];
    return players.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      number: p.number,
      position: POSITION_ES[p.position] ?? p.position,
      photo: p.photo,
    }));
  });
}

export interface RealInjury {
  playerName: string;
  reason: string;
  date: string;
}

interface AFInjuriesResponse {
  response: { player: { name: string; type: string; reason: string }; fixture: { date: string } }[];
}

export async function getRealInjuries(teamName: string): Promise<RealInjury[] | null> {
  if (!isSquadDataEnabled()) return null;
  const teamId = await resolveTeamId(teamName);
  if (!teamId) return null;

  return cached(`af-injuries-${teamId}`, INJURIES_TTL, async () => {
    const season = new Date().getFullYear();
    const data = await fetchAF<AFInjuriesResponse>(`/injuries?team=${teamId}&season=${season}`);
    return (data.response ?? []).slice(0, 10).map((row) => ({
      playerName: row.player.name,
      reason: row.player.reason || row.player.type || "Baja",
      date: row.fixture?.date ?? "",
    }));
  });
}

export interface RealTransfer {
  playerName: string;
  date: string;
  fromClub: string;
  toClub: string;
  type: string;
}

interface AFTransfersResponse {
  response: {
    player: { name: string };
    transfers: { date: string; type: string | null; teams: { in: { name: string }; out: { name: string } } }[];
  }[];
}

export async function getRealTeamTransfers(teamName: string): Promise<RealTransfer[] | null> {
  if (!isSquadDataEnabled()) return null;
  const teamId = await resolveTeamId(teamName);
  if (!teamId) return null;

  return cached(`af-transfers-${teamId}`, TRANSFERS_TTL, async () => {
    const data = await fetchAF<AFTransfersResponse>(`/transfers?team=${teamId}`);
    const rows: RealTransfer[] = [];
    for (const entry of data.response ?? []) {
      const latest = entry.transfers?.[0];
      if (!latest) continue;
      rows.push({
        playerName: entry.player.name,
        date: latest.date,
        fromClub: latest.teams.out.name,
        toClub: latest.teams.in.name,
        type: latest.type ?? "Traspaso",
      });
    }
    return rows
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  });
}
