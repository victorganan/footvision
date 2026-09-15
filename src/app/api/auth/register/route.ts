import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, getUserByEmail, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2).max(40),
  password: z.string().min(6).max(72),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }

  const { email, displayName, password } = parsed.data;
  if (getUserByEmail(email)) {
    return NextResponse.json({ error: "Ese email ya esta registrado" }, { status: 409 });
  }

  const user = createUser(email, displayName, password);
  await setSessionCookie(user.id);

  return NextResponse.json({ id: user.id, email: user.email, displayName: user.display_name, footcoins: user.footcoins });
}
