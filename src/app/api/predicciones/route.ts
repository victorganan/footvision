import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserPredictions, placePrediction, resolvePendingPredictions, InsufficientCoinsError } from "@/lib/predictions";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const resolution = resolvePendingPredictions(user.id);
  const predictions = getUserPredictions(user.id);
  return NextResponse.json({ predictions, resolution });
}

const schema = z.object({
  matchId: z.string(),
  pick: z.enum(["home", "draw", "away"]),
  stake: z.number().int().min(0).max(1000),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });

  try {
    const prediction = placePrediction(user.id, parsed.data.matchId, parsed.data.pick, parsed.data.stake);
    return NextResponse.json({ prediction });
  } catch (err) {
    if (err instanceof InsufficientCoinsError) {
      return NextResponse.json({ error: "No tienes suficientes FootCoins para esa apuesta" }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
