import { type NextRequest } from "next/server";
import { getCreneauxPris } from "@/lib/data";
import { adresseClient, limiter } from "@/lib/rate-limit";
import { estDate } from "@/lib/validation";

// GET /api/creneaux?medecin=3&date=2026-10-12 → { pris: ["09:00", …] }
// Cache-Control: no-store comes from the /api/:path* rule in next.config.ts.
export async function GET(request: NextRequest) {
  // Open endpoint doing a database read per call: the booking form polls it as the user
  // picks a doctor and a date, so the ceiling is well above normal use but finite.
  const limite = limiter(`creneaux:${await adresseClient()}`, 120, 60);
  if (!limite.ok) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limite.retryAfter) } },
    );
  }

  const medecin = Number(request.nextUrl.searchParams.get("medecin"));
  const date = request.nextUrl.searchParams.get("date") ?? "";
  // estDate, not the shape alone: "2026-13-45" passes a DATE regex, and MySQL compares
  // it as NULL, so the endpoint answered 200 with an empty list instead of rejecting it.
  if (!Number.isInteger(medecin) || medecin < 1 || !estDate(date)) {
    return Response.json({ error: "Invalid parameters" }, { status: 400 });
  }
  const pris = await getCreneauxPris(medecin, date);
  return Response.json({ pris });
}
