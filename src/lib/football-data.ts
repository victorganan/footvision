import teamsJson from "@/data/teams.json";
import playersJson from "@/data/players.json";
import matchesJson from "@/data/matches.json";
import transfersJson from "@/data/transfers.json";
import newsJson from "@/data/news.json";
import type { Match, NewsItem, Player, Team, TransferRumor } from "./types";

/**
 * Capa de acceso a datos deportivos.
 *
 * FootVision está pensado para autoalimentarse de fuentes públicas y
 * gratuitas (football-data.org, API-Football, feeds RSS de mercado...).
 * Este módulo aísla el resto de la app de ese origen: hoy sirve el
 * dataset simulado de src/data, y el día que se configure
 * FOOTBALL_DATA_API_KEY basta con implementar un provider nuevo que
 * cumpla la misma interfaz y sustituir `getProvider()`.
 */
interface FootballDataProvider {
  getTeams(): Team[];
  getPlayers(): Player[];
  getMatches(): Match[];
  getTransfers(): TransferRumor[];
  getNews(): NewsItem[];
}

class MockProvider implements FootballDataProvider {
  getTeams(): Team[] {
    return teamsJson as Team[];
  }
  getPlayers(): Player[] {
    return playersJson as Player[];
  }
  getMatches(): Match[] {
    return matchesJson as Match[];
  }
  getTransfers(): TransferRumor[] {
    return transfersJson as TransferRumor[];
  }
  getNews(): NewsItem[] {
    return newsJson as NewsItem[];
  }
}

function getProvider(): FootballDataProvider {
  // Punto de extensión: cuando exista un provider real (football-data.org,
  // API-Football...) se selecciona aquí según FOOTBALL_DATA_PROVIDER.
  return new MockProvider();
}

const provider = getProvider();

export function getTeams(): Team[] {
  return provider.getTeams();
}

export function getTeamBySlug(slug: string): Team | undefined {
  return provider.getTeams().find((t) => t.slug === slug);
}

export function getTeamById(id: string): Team | undefined {
  return provider.getTeams().find((t) => t.id === id);
}

export function getPlayers(): Player[] {
  return provider.getPlayers();
}

export function getPlayerBySlug(slug: string): Player | undefined {
  return provider.getPlayers().find((p) => p.slug === slug);
}

export function getPlayerById(id: string): Player | undefined {
  return provider.getPlayers().find((p) => p.id === id);
}

export function getPlayersByTeam(teamId: string): Player[] {
  return provider.getPlayers().filter((p) => p.teamId === teamId);
}

export function getMatches(): Match[] {
  return [...provider.getMatches()].sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
  );
}

export function getMatchById(id: string): Match | undefined {
  return provider.getMatches().find((m) => m.id === id);
}

export function getLiveMatches(): Match[] {
  return getMatches().filter((m) => m.status === "live");
}

export function getUpcomingMatches(limit?: number): Match[] {
  const upcoming = getMatches().filter((m) => m.status === "scheduled");
  return limit ? upcoming.slice(0, limit) : upcoming;
}

export function getFinishedMatches(limit?: number): Match[] {
  const finished = getMatches()
    .filter((m) => m.status === "finished")
    .sort((a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime());
  return limit ? finished.slice(0, limit) : finished;
}

export function getMatchesByTeam(teamId: string): Match[] {
  return getMatches().filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId);
}

export function getTransfers(): TransferRumor[] {
  return provider.getTransfers();
}

export function getRumors(): TransferRumor[] {
  return getTransfers()
    .filter((t) => t.status === "rumor")
    .sort((a, b) => b.probability - a.probability);
}

export function getOfficialTransfers(): TransferRumor[] {
  return getTransfers().filter((t) => t.status === "official");
}

export function getFreeAgents(): TransferRumor[] {
  return getTransfers().filter((t) => t.status === "free-agent");
}

export function getExpiringContracts(): TransferRumor[] {
  return getTransfers().filter((t) => t.status === "expiring");
}

export function getNews(limit?: number): NewsItem[] {
  const sorted = [...provider.getNews()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

export function getTodayTransferNews(): NewsItem[] {
  return getNews().filter((n) => n.category === "Mercado");
}

export function getTopScorers(limit = 10): Player[] {
  return [...getPlayers()].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, limit);
}

export function getTopAssisters(limit = 10): Player[] {
  return [...getPlayers()].sort((a, b) => b.stats.assists - a.stats.assists).slice(0, limit);
}

export function getStandings(league: string) {
  const teams = getTeams().filter((t) => t.league === league);
  const matches = getMatches().filter((m) => m.league === league && m.status === "finished");

  const table = new Map<
    string,
    { teamId: string; played: number; wins: number; draws: number; losses: number; gf: number; ga: number; points: number }
  >();

  for (const team of teams) {
    table.set(team.id, { teamId: team.id, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0 });
  }

  for (const match of matches) {
    const home = table.get(match.homeTeamId);
    const away = table.get(match.awayTeamId);
    if (!home || !away || match.homeScore === null || match.awayScore === null) continue;

    home.played++;
    away.played++;
    home.gf += match.homeScore;
    home.ga += match.awayScore;
    away.gf += match.awayScore;
    away.ga += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.wins++;
      home.points += 3;
      away.losses++;
    } else if (match.homeScore < match.awayScore) {
      away.wins++;
      away.points += 3;
      home.losses++;
    } else {
      home.draws++;
      away.draws++;
      home.points += 1;
      away.points += 1;
    }
  }

  return Array.from(table.values()).sort(
    (a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga)
  );
}
