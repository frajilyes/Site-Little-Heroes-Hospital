import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { execute, queryOne } from "./db";
import { mailCode, sendMail } from "./mail";
import { signToken, verifyToken } from "./session";

// Codes de confirmation envoyés aux familles (prise et annulation de rendez-vous).
// Le navigateur ne garde qu'un jeton signé ; les données en attente restent en base.

export type ObjetCode = "rdv" | "annulation";

export const CODE_DURATION_MIN = 15;
export const RESEND_DELAY_S = 60;
const MAX_ATTEMPTS = 5;
const MAX_CODES_PAR_HEURE = 5; // par adresse e-mail : évite d'utiliser le site pour spammer

const LIBELLES: Record<ObjetCode, string> = {
  rdv: "confirmer votre demande de rendez-vous",
  annulation: "confirmer l'annulation de votre rendez-vous",
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

/** Enregistre une demande en attente, envoie le code et renvoie le jeton à rendre avec le code. */
export async function creerCode(objet: ObjetCode, email: string, donnees: Record<string, string>): Promise<string> {
  // Ménage : les demandes jamais confirmées sont oubliées au bout d'un jour
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

/** Renvoie un nouveau code pour la même demande. Retourne le nombre de secondes à patienter (0 = envoyé). */
export async function renvoyerCode(jeton: string): Promise<number> {
  const j = await verifyToken<Jeton>("code-email", jeton);
  if (!j) throw new Error("Jeton invalide");
  const row = await queryOne<{ email: string; attente: number }>(
    "SELECT email, GREATEST(0, ? - TIMESTAMPDIFF(SECOND, created_at, NOW())) AS attente FROM codes_email WHERE id = ?",
    [RESEND_DELAY_S, j.id],
  );
  if (!row) throw new Error("Demande introuvable");
  if (Number(row.attente) > 0) return Number(row.attente);
  await envoyer(j.id, j.objet, row.email);
  return 0;
}

export type Verification =
  | { ok: true; email: string; donnees: Record<string, string> }
  | { ok: false; raison: "invalide" | "expire" };

/** Vérifie le code : 5 essais maximum, usage unique. La demande est supprimée en cas de succès. */
export async function verifierCode(objet: ObjetCode, jeton: string, code: string): Promise<Verification> {
  const j = await verifyToken<Jeton>("code-email", jeton);
  if (!j || j.objet !== objet) return { ok: false, raison: "expire" };

  // Compteur incrémenté avant la comparaison : la limite tient même avec des requêtes parallèles.
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
  if (!timingSafeEqual(Buffer.from(row.code_hash, "hex"), Buffer.from(hashCode(j.id, code), "hex")))
    return { ok: false, raison: "invalide" };

  // Usage unique : seul le premier qui supprime la ligne valide la demande
  const del = await execute("DELETE FROM codes_email WHERE id = ?", [j.id]);
  if (del.affectedRows === 0) return { ok: false, raison: "expire" };
  const donnees = typeof row.donnees === "string" ? JSON.parse(row.donnees) : row.donnees;
  return { ok: true, email: row.email, donnees };
}
