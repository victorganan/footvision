import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserStats } from "@/lib/predictions";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: { id: user.id, email: user.email, displayName: user.display_name },
    stats: getUserStats(user.id),
  });
}
