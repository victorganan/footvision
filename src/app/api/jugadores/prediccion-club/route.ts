import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { spendCoins, InsufficientCoinsError } from "@/lib/footcoins";
import { predictNextClub } from "@/lib/scouting";

const COST = 8;
const schema = z.object({ playerId: z.string() });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });

  try {
    spendCoins(user.id, COST, `Prediccion de proximo club (${parsed.data.playerId})`);
  } catch (err) {
    if (err instanceof InsufficientCoinsError) {
      return NextResponse.json({ error: `Necesitas ${COST} FootCoins para esta predicción` }, { status: 400 });
    }
    throw err;
  }

  const prediction = await predictNextClub(parsed.data.playerId);
  return NextResponse.json({ prediction, cost: COST });
}
