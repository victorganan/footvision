import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseNaturalLanguageQuery, searchPlayers, type ScoutFilters } from "@/lib/scouting";
import { getTeamById } from "@/lib/football-data";

const schema = z.object({
  query: z.string().optional(),
  maxAge: z.number().optional(),
  minAge: z.number().optional(),
  maxValueM: z.number().optional(),
  minValueM: z.number().optional(),
  position: z.enum(["Portero", "Defensa", "Centrocampista", "Delantero"]).optional(),
  league: z.string().optional(),
  foot: z.enum(["Izquierda", "Derecha", "Ambidiestro"]).optional(),
  minHeightCm: z.number().optional(),
  maxHeightCm: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Filtros invalidos" }, { status: 400 });

  let filters: ScoutFilters = { ...parsed.data };
  if (parsed.data.query) {
    filters = { ...parseNaturalLanguageQuery(parsed.data.query), ...filters };
  }

  const results = searchPlayers(filters)
    .slice(0, 30)
    .map((p) => ({
      ...p,
      team: p.teamId ? getTeamById(p.teamId) ?? null : null,
    }));

  return NextResponse.json({ filters, results });
}
