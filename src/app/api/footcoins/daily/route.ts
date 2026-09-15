import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { claimDailyLogin } from "@/lib/footcoins";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const result = claimDailyLogin(user.id);
  return NextResponse.json(result);
}
