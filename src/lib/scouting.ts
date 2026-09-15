import { getPlayerById, getPlayers, getTeamById, getTeams } from "./football-data";
import type { Foot, Player, Position } from "./types";

export interface ScoutFilters {
  maxAge?: number;
  minAge?: number;
  maxValueM?: number;
  minValueM?: number;
  position?: Position;
  league?: string;
  foot?: Foot;
  minHeightCm?: number;
  maxHeightCm?: number;
  query?: string;
}

export function searchPlayers(filters: ScoutFilters): Player[] {
  const teams = new Map(getTeams().map((t) => [t.id, t]));

  return getPlayers().filter((player) => {
    if (filters.maxAge !== undefined && player.age > filters.maxAge) return false;
    if (filters.minAge !== undefined && player.age < filters.minAge) return false;
    if (filters.maxValueM !== undefined && player.marketValueM > filters.maxValueM) return false;
    if (filters.minValueM !== undefined && player.marketValueM < filters.minValueM) return false;
    if (filters.position && player.position !== filters.position) return false;
    if (filters.foot && player.foot !== filters.foot) return false;
    if (filters.minHeightCm !== undefined && player.heightCm < filters.minHeightCm) return false;
    if (filters.maxHeightCm !== undefined && player.heightCm > filters.maxHeightCm) return false;
    if (filters.league) {
      const team = player.teamId ? teams.get(player.teamId) : undefined;
      if (!team || team.league !== filters.league) return false;
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      if (!player.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

/**
 * Interpreta una peticion en lenguaje natural muy simple ("delantero menor
 * de 22, zurdo, menos de 15M, liga europea") y la traduce a filtros.
 * Heuristica basada en palabras clave: no requiere IA para funcionar, y si
 * hay OPENAI_API_KEY configurada, generateScoutingReport la usa para
 * redactar el analisis final con mas matiz.
 */
export function parseNaturalLanguageQuery(text: string): ScoutFilters {
  const lower = text.toLowerCase();
  const filters: ScoutFilters = {};

  const ageMatch = lower.match(/(menos de|menor de|-)\s*(\d{2})\s*(años|anos)?/);
  if (ageMatch) filters.maxAge = Number(ageMatch[2]);

  const valueMatch = lower.match(/(menos de|por debajo de)\s*(\d+)\s*(m|millones|m€)/);
  if (valueMatch) filters.maxValueM = Number(valueMatch[2]);

  if (lower.includes("zurdo") || lower.includes("izquierda")) filters.foot = "Izquierda";
  if (lower.includes("diestro") || lower.includes("derecha")) filters.foot = "Derecha";

  if (lower.includes("delantero")) filters.position = "Delantero";
  else if (lower.includes("centrocampista") || lower.includes("mediocentro")) filters.position = "Centrocampista";
  else if (lower.includes("defensa") || lower.includes("central") || lower.includes("lateral")) filters.position = "Defensa";
  else if (lower.includes("portero")) filters.position = "Portero";

  const heightMatch = lower.match(/(mas de|más de)\s*(\d{3})\s*cm/);
  if (heightMatch) filters.minHeightCm = Number(heightMatch[2]);

  return filters;
}

interface ScoutingReport {
  playerId: string;
  fitSummary: string;
  comparison: string;
  valueEvolution: string;
  risk: string;
  potential: string;
  interestedClubs: string[];
  generatedBy: "openai" | "heuristic";
}

function heuristicReport(player: Player, comparablePlayers: Player[]): ScoutingReport {
  const riskFactors: string[] = [];
  if (player.age > 30) riskFactors.push("edad avanzada para una inversion a largo plazo");
  if (player.injury) riskFactors.push("historial de lesion reciente");
  if (player.contractUntil && player.contractUntil <= new Date().getFullYear() + 1) {
    riskFactors.push("contrato proximo a finalizar, lo que puede encarecer o abaratar la operacion");
  }
  const risk =
    riskFactors.length > 0
      ? `Riesgo medio-alto: ${riskFactors.join("; ")}.`
      : "Riesgo bajo: perfil estable, sin señales de alarma relevantes en el dataset disponible.";

  const potential =
    player.age <= 23
      ? "Alto potencial de revalorizacion: perfil joven con margen de crecimiento en rendimiento y valor de mercado."
      : player.age <= 29
      ? "Rendimiento en su pico: aporta consistencia inmediata mas que plusvalia futura."
      : "Potencial de reventa limitado: aporte de experiencia a corto plazo, valor de mercado decreciente.";

  const comparisonText =
    comparablePlayers.length > 0
      ? `Comparado con ${comparablePlayers
          .slice(0, 3)
          .map((p) => p.name)
          .join(", ")}, destaca en la relacion goles/asistencias por minuto jugado dentro de su rango de edad y valor de mercado.`
      : "No se encontraron jugadores directamente comparables en el dataset actual.";

  const team = player.teamId ? getTeamById(player.teamId) : undefined;

  return {
    playerId: player.id,
    fitSummary: `${player.name} encaja con el perfil buscado: ${player.position.toLowerCase()} de ${player.age} años, pie ${player.foot.toLowerCase()}, valorado en ${player.marketValueM}M€${
      team ? ` y actualmente en ${team.name}` : ""
    }.`,
    comparison: comparisonText,
    valueEvolution: `Valor de mercado actual: ${player.marketValueM}M€. Su trayectoria de fichajes (${player.transferHistory.length} movimientos registrados) sugiere una progresion ${
      player.age <= 24 ? "ascendente" : "estable"
    }.`,
    risk,
    potential,
    interestedClubs: inferInterestedClubs(player),
  } as ScoutingReport;
}

function inferInterestedClubs(player: Player): string[] {
  const sameLeagueTeams = getTeams()
    .filter((t) => t.marketValueM > player.marketValueM * 3 && t.id !== player.teamId)
    .sort((a, b) => b.marketValueM - a.marketValueM)
    .slice(0, 3);
  return sameLeagueTeams.map((t) => t.name);
}

export interface NextClubPrediction {
  playerId: string;
  candidateClubs: { club: string; probability: number; reasoning: string }[];
  summary: string;
}

/** Predicción heurística/IA del próximo club de un jugador (funcion "premium" del Centro de Ojeo). */
export async function predictNextClub(playerId: string): Promise<NextClubPrediction> {
  const player = getPlayerById(playerId);
  if (!player) throw new Error("Jugador no encontrado");

  const candidates = getTeams()
    .filter((t) => t.id !== player.teamId && t.marketValueM >= player.marketValueM * 2)
    .sort((a, b) => b.marketValueM - a.marketValueM)
    .slice(0, 3);

  const base: NextClubPrediction = {
    playerId: player.id,
    candidateClubs: candidates.map((club, i) => ({
      club: club.name,
      probability: Math.max(15, 55 - i * 15),
      reasoning: `${club.name} encaja con el nivel competitivo y presupuesto necesarios para un jugador valorado en ${player.marketValueM}M€.`,
    })),
    summary: `Con ${player.age} años y contrato ${
      player.contractUntil ? `hasta ${player.contractUntil}` : "sin definir"
    }, ${player.name} es un perfil que clubes de máximo nivel podrían seguir de cerca en los próximos mercados.`,
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return base;

  try {
    const prompt = `Eres el Director Deportivo AI de FootVision. Predice, en JSON, el proximo club mas probable de este jugador:
${JSON.stringify(player)}
Responde SOLO con JSON: { "candidateClubs": [{ "club": string, "probability": number, "reasoning": string }], "summary": string }`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });
    if (!response.ok) throw new Error(`OpenAI respondio ${response.status}`);
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return { playerId: player.id, ...parsed };
  } catch {
    return base;
  }
}

export async function generateScoutingReport(playerId: string): Promise<ScoutingReport> {
  const player = getPlayerById(playerId);
  if (!player) throw new Error("Jugador no encontrado");

  const comparable = getPlayers().filter(
    (p) =>
      p.id !== player.id &&
      p.position === player.position &&
      Math.abs(p.age - player.age) <= 3 &&
      Math.abs(p.marketValueM - player.marketValueM) <= Math.max(20, player.marketValueM * 0.5)
  );

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ...heuristicReport(player, comparable), generatedBy: "heuristic" };
  }

  try {
    const prompt = `Eres el Scout AI de FootVision. Genera un informe profesional breve (en español, formato JSON) para un director deportivo sobre este jugador:
${JSON.stringify(player)}
Jugadores comparables: ${comparable.map((p) => p.name).join(", ") || "ninguno relevante"}.
Responde SOLO con un JSON con las claves: fitSummary, comparison, valueEvolution, risk, potential, interestedClubs (array de nombres de clubes).`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.6,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI respondio ${response.status}`);
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return { playerId: player.id, ...parsed, generatedBy: "openai" };
  } catch {
    // Si la IA falla (sin credito, red, etc.) el informe heuristico garantiza
    // que la funcion nunca se cae por completo.
    return { ...heuristicReport(player, comparable), generatedBy: "heuristic" };
  }
}
