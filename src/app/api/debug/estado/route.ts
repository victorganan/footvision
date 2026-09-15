import { NextResponse } from "next/server";
import { isRealDataEnabled, getRealMatches } from "@/lib/football-data-real";
import { getAccountStatus, isSquadDataEnabled } from "@/lib/api-football";

/**
 * Endpoint de diagnostico (sin datos sensibles) para comprobar, ya desplegado,
 * si las claves de football-data.org y API-Football funcionan de verdad.
 * Visitalo directamente en el navegador: /api/debug/estado
 */
export async function GET() {
  const footballDataOrg: Record<string, unknown> = { keyConfigured: isRealDataEnabled() };
  if (isRealDataEnabled()) {
    try {
      const matches = await getRealMatches();
      footballDataOrg.ok = true;
      footballDataOrg.matchesFound = matches.length;
    } catch (err) {
      footballDataOrg.ok = false;
      footballDataOrg.error = err instanceof Error ? err.message : String(err);
    }
  }

  const apiFootball: Record<string, unknown> = { keyConfigured: isSquadDataEnabled() };
  if (isSquadDataEnabled()) {
    try {
      apiFootball.status = await getAccountStatus();
      apiFootball.ok = true;
    } catch (err) {
      apiFootball.ok = false;
      apiFootball.error = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({ footballDataOrg, apiFootball });
}
