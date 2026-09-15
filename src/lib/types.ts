export type Position = "Portero" | "Defensa" | "Centrocampista" | "Delantero";
export type Foot = "Izquierda" | "Derecha" | "Ambidiestro";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  league: string;
  country: string;
  crestColor: string;
  crestUrl?: string;
  founded: number;
  stadium: string;
  coach: string;
  marketValueM: number;
  /** true si el equipo procede de una API real y no tiene plantilla/mercado simulados. */
  isExternal?: boolean;
}

export interface Player {
  id: string;
  slug: string;
  name: string;
  teamId: string | null;
  nationality: string;
  age: number;
  birthYear: number;
  position: Position;
  foot: Foot;
  heightCm: number;
  marketValueM: number;
  contractUntil: number | null;
  shirtNumber: number;
  stats: {
    apps: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPerGoal: number | null;
  };
  transferHistory: { year: number; from: string; to: string; feeM: number | null }[];
  injury?: { description: string; expectedReturn: string } | null;
}

export interface MatchEvent {
  minute: number;
  type: "goal" | "yellow" | "red" | "sub" | "var";
  team: "home" | "away";
  description: string;
}

export interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  xg: [number, number];
  corners: [number, number];
  fouls: [number, number];
  cards: [number, number];
}

export interface Match {
  id: string;
  league: string;
  round: string;
  kickoff: string; // ISO
  status: "scheduled" | "live" | "finished";
  minute?: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  venue: string;
  events: MatchEvent[];
  stats: MatchStats | null;
  lineups?: {
    home: string[];
    away: string[];
  };
}

export interface TransferRumor {
  id: string;
  playerId: string;
  fromTeamId: string;
  toTeamId: string;
  probability: number;
  feeEstimateM: number | null;
  updatedAt: string;
  status: "rumor" | "official" | "free-agent" | "expiring";
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  teamId?: string;
  playerId?: string;
}

export type PredictionPick = "home" | "draw" | "away";
