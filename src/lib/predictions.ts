import { getDb } from "./db";
import { getMatchById } from "./football-data";
import { grantCoins, spendCoins, InsufficientCoinsError } from "./footcoins";
import { getUserById } from "./auth";
import type { PredictionPick } from "./types";

export { InsufficientCoinsError };

export interface PredictionRecord {
  id: number;
  user_id: string;
  match_id: string;
  pick: PredictionPick;
  stake: number;
  status: "pending" | "won" | "lost";
  created_at: string;
  resolved_at: string | null;
}

function matchResult(homeScore: number, awayScore: number): PredictionPick {
  if (homeScore > awayScore) return "home";
  if (homeScore < awayScore) return "away";
  return "draw";
}

export function getUserPredictions(userId: string): PredictionRecord[] {
  return getDb()
    .prepare(`SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC`)
    .all(userId) as PredictionRecord[];
}

export function getPredictionForMatch(userId: string, matchId: string): PredictionRecord | undefined {
  return getDb()
    .prepare(`SELECT * FROM predictions WHERE user_id = ? AND match_id = ?`)
    .get(userId, matchId) as PredictionRecord | undefined;
}

export async function placePrediction(
  userId: string,
  matchId: string,
  pick: PredictionPick,
  stake: number
): Promise<PredictionRecord> {
  const match = await getMatchById(matchId);
  if (!match) throw new Error("Partido no encontrado");
  if (match.status !== "scheduled") throw new Error("Ya no se puede predecir este partido");

  const existing = getPredictionForMatch(userId, matchId);
  if (existing) throw new Error("Ya has hecho una prediccion para este partido");

  if (stake < 0) throw new Error("La apuesta no puede ser negativa");

  const db = getDb();
  const now = new Date().toISOString();

  const tx = db.transaction(() => {
    if (stake > 0) {
      spendCoins(userId, stake, `Apuesta en ${match.homeTeamId} vs ${match.awayTeamId}`);
    }
    db.prepare(
      `INSERT INTO predictions (user_id, match_id, pick, stake, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)`
    ).run(userId, matchId, pick, stake, now);
  });
  tx();

  return getPredictionForMatch(userId, matchId)!;
}

function currentWinStreak(userId: string): number {
  const rows = getDb()
    .prepare(
      `SELECT status FROM predictions WHERE user_id = ? AND status != 'pending' ORDER BY resolved_at DESC`
    )
    .all(userId) as { status: string }[];
  let streak = 0;
  for (const row of rows) {
    if (row.status === "won") streak++;
    else break;
  }
  return streak;
}

/** Resuelve todas las predicciones pendientes cuyos partidos ya han finalizado. */
export async function resolvePendingPredictions(userId: string): Promise<{ resolved: number; coinsWon: number }> {
  const db = getDb();
  const pending = db
    .prepare(`SELECT * FROM predictions WHERE user_id = ? AND status = 'pending'`)
    .all(userId) as PredictionRecord[];

  let resolved = 0;
  let coinsWon = 0;

  for (const prediction of pending) {
    const match = await getMatchById(prediction.match_id);
    if (!match || match.status !== "finished" || match.homeScore === null || match.awayScore === null) {
      continue;
    }

    const result = matchResult(match.homeScore, match.awayScore);
    const correct = result === prediction.pick;
    const now = new Date().toISOString();

    db.prepare(`UPDATE predictions SET status = ?, resolved_at = ? WHERE id = ?`).run(
      correct ? "won" : "lost",
      now,
      prediction.id
    );
    resolved++;

    if (correct) {
      const reward = prediction.stake > 0 ? prediction.stake * 2 : 1;
      grantCoins(userId, reward, prediction.stake > 0 ? "Apuesta acertada (x2)" : "Prediccion acertada");
      coinsWon += reward;

      const streak = currentWinStreak(userId);
      if (streak > 0 && streak % 5 === 0) {
        grantCoins(userId, 5, `Racha de ${streak} predicciones acertadas`);
        coinsWon += 5;
      }
    }
  }

  return { resolved, coinsWon };
}

export function getUserStats(userId: string) {
  const user = getUserById(userId);
  const all = getUserPredictions(userId);
  const resolved = all.filter((p) => p.status !== "pending");
  const won = resolved.filter((p) => p.status === "won");
  const accuracy = resolved.length > 0 ? Math.round((won.length / resolved.length) * 100) : 0;

  return {
    footcoins: user?.footcoins ?? 0,
    loginStreak: user?.login_streak ?? 0,
    totalPredictions: resolved.length,
    correctPredictions: won.length,
    accuracy,
    currentStreak: currentWinStreak(userId),
  };
}
