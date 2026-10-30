import "server-only";
import { headers } from "next/headers";

/**
 * Fixed-window counters held in memory. No external store, no dependency: a Map lookup
 * per call, so the cost is negligible compared to the database round-trip it guards.
 *
 * Scope is one server process, which matches this deployment (a single Node server).
 * Behind several instances each would count separately, so the effective limit is
 * multiplied by the instance count — enough to stop brute force and form spam, not a
 * billing-grade quota.
 */
type Fenetre = { n: number; reset: number };

const compteurs = new Map<string, Fenetre>();

// Bound the memory an attacker rotating addresses can make us hold (~50k keys, a few MB).
const MAX_CLES = 50_000;
const NETTOYAGE_MS = 60_000;
let prochainNettoyage = 0;

/** Drops expired windows. Amortized: at most once a minute, whatever the traffic. */
function nettoyer(now: number) {
  if (now < prochainNettoyage) return;
  prochainNettoyage = now + NETTOYAGE_MS;
  for (const [cle, f] of compteurs) if (f.reset <= now) compteurs.delete(cle);
}

/** Over the cap, evict the windows closest to expiring rather than flushing everything. */
function evincer() {
  const vivants = [...compteurs].sort((a, b) => a[1].reset - b[1].reset);
  for (const [cle] of vivants.slice(0, Math.ceil(vivants.length / 10))) compteurs.delete(cle);
}

export interface Limite {
  /** false once the window is full: the caller must stop before doing any real work. */
  ok: boolean;
  /** Seconds until the window resets (0 when ok). */
  retryAfter: number;
}

/**
 * Counts one hit against `cle` and says whether it is still within `max` per `fenetreS`.
 * Call it *before* the expensive part (password hashing, e-mail, INSERT).
 */
export function limiter(cle: string, max: number, fenetreS: number): Limite {
  const now = Date.now();
  nettoyer(now);

  const f = compteurs.get(cle);
  if (!f || f.reset <= now) {
    if (compteurs.size >= MAX_CLES) evincer();
    compteurs.set(cle, { n: 1, reset: now + fenetreS * 1000 });
    return { ok: true, retryAfter: 0 };
  }

  f.n += 1;
  if (f.n > max) return { ok: false, retryAfter: Math.max(1, Math.ceil((f.reset - now) / 1000)) };
  return { ok: true, retryAfter: 0 };
}

/**
 * Caller address, read from the headers the reverse proxy puts in front of the app.
 *
 * These headers are client-supplied unless a proxy overwrites them, so a determined
 * attacker on a misconfigured host can rotate the value. Address limits are therefore
 * always paired with a limit on something the attacker does not choose freely (the
 * target e-mail, the appointment reference) rather than relied on alone.
 */
export async function adresseClient(): Promise<string> {
  const h = await headers();
  // Left-most entry is the original client; the rest are the proxies it crossed.
  const transmis = h.get("x-forwarded-for");
  if (transmis) return transmis.split(",")[0].trim();
  return h.get("x-real-ip") ?? "local";
}

/** Human delay for a form message: "30s" below a minute, "5 min" above. */
export function delai(secondes: number): string {
  return secondes < 60 ? `${secondes}s` : `${Math.ceil(secondes / 60)} min`;
}
