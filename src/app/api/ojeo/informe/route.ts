import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { spendCoins, InsufficientCoinsError } from "@/lib/footcoins";
import { generateScoutingReport } from "@/lib/scouting";
import { getDb } from "@/lib/db";

const REPORT_COST = 5;

const schema = z.object({ playerId: z.string() });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });

  try {
    spendCoins(user.id, REPORT_COST, `Informe profesional (${parsed.data.playerId})`);
  } catch (err) {
    if (err instanceof InsufficientCoinsError) {
      return NextResponse.json(
        { error: `Necesitas ${REPORT_COST} FootCoins para generar este informe` },
        { status: 400 }
      );
    }
    throw err;
  }

  const report = await generateScoutingReport(parsed.data.playerId);

  getDb()
    .prepare(`INSERT INTO scouting_reports (user_id, player_id, cost, created_at) VALUES (?, ?, ?, ?)`)
    .run(user.id, parsed.data.playerId, REPORT_COST, new Date().toISOString());

  return NextResponse.json({ report, cost: REPORT_COST });
}
