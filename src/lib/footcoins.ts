import { getDb } from "./db";
import { getUserById, type UserRecord } from "./auth";

export class InsufficientCoinsError extends Error {
  constructor() {
    super("FootCoins insuficientes");
    this.name = "InsufficientCoinsError";
  }
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

function isConsecutiveDay(previous: Date, now: Date): boolean {
  const diffDays = Math.round((now.getTime() - previous.getTime()) / 86_400_000);
  return diffDays === 1;
}

export function grantCoins(userId: string, amount: number, reason: string): UserRecord {
  const db = getDb();
  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare(`UPDATE users SET footcoins = footcoins + ? WHERE id = ?`).run(amount, userId);
    db.prepare(
      `INSERT INTO footcoin_ledger (user_id, amount, reason, created_at) VALUES (?, ?, ?, ?)`
    ).run(userId, amount, reason, now);
  });
  tx();
  return getUserById(userId)!;
}

export function spendCoins(userId: string, amount: number, reason: string): UserRecord {
  const db = getDb();
  const user = getUserById(userId);
  if (!user || user.footcoins < amount) {
    throw new InsufficientCoinsError();
  }
  return grantCoins(userId, -amount, reason);
}

export interface DailyClaimResult {
  claimed: boolean;
  amount: number;
  streak: number;
  user: UserRecord;
}

/** Bono de login diario: +1 FootCoin, con racha que aumenta el bono cada 5 dias. */
export function claimDailyLogin(userId: string): DailyClaimResult {
  const db = getDb();
  const user = getUserById(userId)!;
  const now = new Date();

  if (user.last_login_claim && isSameDay(new Date(user.last_login_claim), now)) {
    return { claimed: false, amount: 0, streak: user.login_streak, user };
  }

  const continuesStreak = user.last_login_claim
    ? isConsecutiveDay(new Date(user.last_login_claim), now)
    : false;
  const newStreak = continuesStreak ? user.login_streak + 1 : 1;
  const bonus = newStreak % 5 === 0 ? 5 : 1;

  db.prepare(`UPDATE users SET last_login_claim = ?, login_streak = ? WHERE id = ?`).run(
    now.toISOString(),
    newStreak,
    userId
  );

  const updated = grantCoins(
    userId,
    bonus,
    newStreak % 5 === 0 ? `Racha de ${newStreak} dias de inicio de sesion` : "Inicio de sesion diario"
  );

  return { claimed: true, amount: bonus, streak: newStreak, user: updated };
}

export function getLedger(userId: string, limit = 20) {
  return getDb()
    .prepare(`SELECT * FROM footcoin_ledger WHERE user_id = ? ORDER BY id DESC LIMIT ?`)
    .all(userId, limit);
}
