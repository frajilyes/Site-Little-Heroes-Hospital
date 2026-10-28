import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { execute, queryOne } from "./db";
import { mailCode, sendMail } from "./mail";
import { signToken, verifyToken } from "./session";

// Confirmation codes sent to families (booking and cancelling an appointment).
// The browser only keeps a signed token; the pending data stays in the database.

export type ObjetCode = "rdv" | "annulation";

export const CODE_DURATION_MIN = 15;
export const RESEND_DELAY_S = 60;
const MAX_ATTEMPTS = 5;
const MAX_CODES_PAR_HEURE = 5; // per e-mail address: prevents using the site to spam

const LIBELLES: Record<ObjetCode, string> = {
  rdv: "confirm your appointment request",
  annulation: "confirm the cancellation of your appointment",
};

interface Jeton {
  id: number;
  objet: ObjetCode;
  exp: number;
}

export class TropDeDemandes extends Error {}

const hashCode = (id: number, code: string) =>
  createHmac("sha256", process.env.SESSION_SECRET ?? "").update(`email:${id}:${code}`).digest("hex");

const nouveauCode = () => randomInt(0, 1_000_000).toString().padStart(6, "0");

async function envoyer(id: number, objet: ObjetCode, email: string) {
  const code = nouveauCode();
  await execute(
    `UPDATE codes_email SET code_hash = ?, tentatives = 0, created_at = NOW(), expires_at = NOW() + INTERVAL ? MINUTE WHERE id = ?`,
    [hashCode(id, code), CODE_DURATION_MIN, id],
  );
  await sendMail(mailCode({ to: email, code, minutes: CODE_DURATION_MIN, pour: LIBELLES[objet] }));
}

/** Stores a pending request, sends the code, and returns the token to pass back with the code. */
export async function creerCode(objet: ObjetCode, email: string, donnees: Record<string, string>): Promise<string> {
  // Cleanup: requests that are never confirmed are forgotten after one day
  await execute("DELETE FROM codes_email WHERE expires_at < NOW() - INTERVAL 1 DAY");
  const recents = await queryOne<{ n: number }>(
    "SELECT COUNT(*) AS n FROM codes_email WHERE email = ? AND created_at > NOW() - INTERVAL 1 HOUR",
    [email],
  );
  if (Number(recents?.n) >= MAX_CODES_PAR_HEURE) throw new TropDeDemandes();

  const res = await execute(
    `INSERT INTO codes_email (objet, email, donnees, code_hash, expires_at, created_at)
     VALUES (?, ?, ?, '', NOW(), NOW())`,
    [objet, email, JSON.stringify(donnees)],
  );
  const id = res.insertId;
  try {
    await envoyer(id, objet, email);
  } catch (err) {
    await execute("DELETE FROM codes_email WHERE id = ?", [id]);
    throw err;
  }
  return signToken("code-email", { id, objet, exp: Math.floor(Date.now() / 1000) + 60 * 60 });
}

/** Sends a new code for the same request. Returns the number of seconds to wait (0 = sent). */
export async function renvoyerCode(jeton: string): Promise<number> {
  const j = await verifyToken<Jeton>("code-email", jeton);
  if (!j) throw new Error("Invalid token");
  const row = await queryOne<{ email: string; attente: number }>(
    "SELECT email, GREATEST(0, ? - TIMESTAMPDIFF(SECOND, created_at, NOW())) AS attente FROM codes_email WHERE id = ?",
    [RESEND_DELAY_S, j.id],
  );
  if (!row) throw new Error("Request not found");
  if (Number(row.attente) > 0) return Number(row.attente);
  await envoyer(j.id, j.objet, row.email);
  return 0;
}

export type Verification =
  | { ok: true; email: string; donnees: Record<string, string> }
  | { ok: false; raison: "invalide" | "expire" };

/** Verifies the code: 5 attempts maximum, single use. The request is deleted on success. */
export async function verifierCode(objet: ObjetCode, jeton: string, code: string): Promise<Verification> {
  const j = await verifyToken<Jeton>("code-email", jeton);
  if (!j || j.objet !== objet) return { ok: false, raison: "expire" };

  // Counter incremented before the comparison: the limit holds even with parallel requests.
  const res = await execute(
    "UPDATE codes_email SET tentatives = tentatives + 1 WHERE id = ? AND tentatives < ? AND expires_at > NOW()",
    [j.id, MAX_ATTEMPTS],
  );
  if (res.affectedRows === 0) return { ok: false, raison: "expire" };

  const row = await queryOne<{ email: string; donnees: string | Record<string, string>; code_hash: string }>(
    "SELECT email, donnees, code_hash FROM codes_email WHERE id = ?",
    [j.id],
  );
  if (!row) return { ok: false, raison: "expire" };
  const attendu = Buffer.from(row.code_hash, "hex");
  const saisi = Buffer.from(hashCode(j.id, code), "hex");
  // timingSafeEqual throws on differing lengths (a row whose code_hash is still the empty
  // placeholder, for instance): treat it as a wrong code rather than a server error.
  if (attendu.length !== saisi.length || !timingSafeEqual(attendu, saisi))
    return { ok: false, raison: "invalide" };

  // Single use: only the first one to delete the row validates the request
  const del = await execute("DELETE FROM codes_email WHERE id = ?", [j.id]);
  if (del.affectedRows === 0) return { ok: false, raison: "expire" };
  const donnees = typeof row.donnees === "string" ? JSON.parse(row.donnees) : row.donnees;
  return { ok: true, email: row.email, donnees };
}
