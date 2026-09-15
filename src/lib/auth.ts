import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDb } from "./db";

const SESSION_COOKIE = "fv_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function getSecret(): string {
  return process.env.SESSION_SECRET || "footvision-dev-secret-cambia-en-produccion";
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionToken(userId: string): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expires}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresStr, signature] = parts;
  const payload = `${userId}.${expiresStr}`;
  const expected = sign(payload);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  if (Date.now() > Number(expiresStr)) return null;
  return userId;
}

export interface UserRecord {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  footcoins: number;
  created_at: string;
  last_login_claim: string | null;
  login_streak: number;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function createUser(email: string, displayName: string, password: string): UserRecord {
  const db = getDb();
  const id = crypto.randomUUID();
  const passwordHash = hashPassword(password);
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO users (id, email, display_name, password_hash, footcoins, created_at, login_streak)
     VALUES (?, ?, ?, ?, ?, ?, 0)`
  ).run(id, email.toLowerCase().trim(), displayName.trim(), passwordHash, 5, createdAt);
  db.prepare(
    `INSERT INTO footcoin_ledger (user_id, amount, reason, created_at) VALUES (?, ?, ?, ?)`
  ).run(id, 5, "Bono de bienvenida", createdAt);
  return getUserById(id)!;
}

export function getUserByEmail(email: string): UserRecord | undefined {
  return getDb()
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .get(email.toLowerCase().trim()) as UserRecord | undefined;
}

export function getUserById(id: string): UserRecord | undefined {
  return getDb().prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRecord | undefined;
}

export async function getCurrentUser(): Promise<UserRecord | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const userId = verifySessionToken(token);
  if (!userId) return null;
  return getUserById(userId) ?? null;
}

export async function setSessionCookie(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
