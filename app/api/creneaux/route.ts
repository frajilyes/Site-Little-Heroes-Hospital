import { type NextRequest } from "next/server";
import { getCreneauxPris } from "@/lib/data";

// GET /api/creneaux?medecin=3&date=2026-10-12 → { pris: ["09:00", …] }
export async function GET(request: NextRequest) {
  const medecin = Number(request.nextUrl.searchParams.get("medecin"));
  const date = request.nextUrl.searchParams.get("date") ?? "";
  if (!Number.isInteger(medecin) || medecin < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Paramètres invalides" }, { status: 400 });
  }
  const pris = await getCreneauxPris(medecin, date);
  return Response.json({ pris }, { headers: { "Cache-Control": "no-store" } });
}
