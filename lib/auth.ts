import "server-only";
import { createHmac, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { execute, queryOne } from "./db";
import { mailCodeVerification, sendMail } from "./mail";
import {
  SESSION_COOKIE,
  SESSION_DURATION_S,
  signSession,
  signToken,
  verifySession,
  verifyToken,
  type SessionPayload,
} from "./session";

const scryptAsync = promisify(scrypt) as (pwd: string, salt: string, len: number) => Promise<Buffer>;

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = await scryptAsync(password, salt, expected.length);
  return timingSafeEqual(expected, actual);
}

export async function createSession(user: Omit<SessionPayload, "exp">) {
  const token = await signSession({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_S });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_S,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export const getSession = cache(async () => verifySession((await cookies()).get(SESSION_COOKIE)?.value));

/** À appeler dans chaque page et Server Action d'administration. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/* ------------------------- Validation en deux étapes (code par e-mail) ------------------------- */

const PENDING_COOKIE = "ph_2fa";
const TRUSTED_COOKIE = "ph_trusted";
export const CODE_DURATION_MIN = 10;
export const RESEND_DELAY_S = 60;
const MAX_ATTEMPTS = 5;
const TRUSTED_DURATION_S = 60 * 60 * 24 * 30; // 30 jours

/** Identifiant connu par le mot de passe, en attente du code reçu par e-mail. */
export interface PendingLogin {
  id: number;
  email: string;
  nom: string;
  from: string;
  exp: number;
}

const cookieOptions = (maxAge: number) =>
  ({ httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge }) as const;

// Le code n'est jamais stocké en clair : HMAC lié à l'admin.
const hashCode = (adminId: number, code: string) =>
  createHmac("sha256", process.env.SESSION_SECRET ?? "").update(`${adminId}:${code}`).digest("hex");

export const getPendingLogin = cache(async () =>
  verifyToken<PendingLogin>("2fa", (await cookies()).get(PENDING_COOKIE)?.value),
);

export async function clearPendingLogin() {
  (await cookies()).delete(PENDING_COOKIE);
}

/** Génère un code à 6 chiffres, l'enregistre (remplace le précédent) et l'envoie par e-mail. */
export async function sendVerificationCode(user: Omit<PendingLogin, "exp">): Promise<void> {
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  await execute(
    `REPLACE INTO admin_codes (admin_id, code_hash, expires_at, tentatives, created_at)
     VALUES (?, ?, NOW() + INTERVAL ? MINUTE, 0, NOW())`,
    [user.id, hashCode(user.id, code), CODE_DURATION_MIN],
  );
  try {
    await sendMail(mailCodeVerification(user.email, user.nom, code, CODE_DURATION_MIN));
  } catch (err) {
    await execute("DELETE FROM admin_codes WHERE admin_id = ?", [user.id]);
    throw err;
  }
  const token = await signToken("2fa", { ...user, exp: Math.floor(Date.now() / 1000) + CODE_DURATION_MIN * 60 });
  (await cookies()).set(PENDING_COOKIE, token, cookieOptions(CODE_DURATION_MIN * 60));
}

/** Secondes restantes avant de pouvoir redemander un code (0 = possible). */
export async function resendCooldown(adminId: number): Promise<number> {
  const row = await queryOne<{ attente: number }>(
    "SELECT GREATEST(0, ? - TIMESTAMPDIFF(SECOND, created_at, NOW())) AS attente FROM admin_codes WHERE admin_id = ?",
    [RESEND_DELAY_S, adminId],
  );
  return Number(row?.attente ?? 0);
}

export type CodeCheck = "ok" | "invalide" | "expire";

/** Vérifie le code saisi : 5 essais maximum, usage unique. */
export async function checkVerificationCode(adminId: number, code: string): Promise<CodeCheck> {
  // Le compteur est incrémenté avant la comparaison : impossible de dépasser la limite en parallèle.
  const res = await execute(
    "UPDATE admin_codes SET tentatives = tentatives + 1 WHERE admin_id = ? AND tentatives < ? AND expires_at > NOW()",
    [adminId, MAX_ATTEMPTS],
  );
  if (res.affectedRows === 0) return "expire";

  const row = await queryOne<{ code_hash: string }>("SELECT code_hash FROM admin_codes WHERE admin_id = ?", [adminId]);
  if (!row) return "expire";
  const expected = Buffer.from(row.code_hash, "hex");
  const actual = Buffer.from(hashCode(adminId, code), "hex");
  if (!timingSafeEqual(expected, actual)) return "invalide";

  await execute("DELETE FROM admin_codes WHERE admin_id = ?", [adminId]);
  return "ok";
}

/** « Ne plus demander sur cet appareil » : dispense de code pendant 30 jours. */
export async function trustDevice(adminId: number) {
  const token = await signToken("trusted", { id: adminId, exp: Math.floor(Date.now() / 1000) + TRUSTED_DURATION_S });
  (await cookies()).set(TRUSTED_COOKIE, token, cookieOptions(TRUSTED_DURATION_S));
}

export async function isTrustedDevice(adminId: number): Promise<boolean> {
  const trusted = await verifyToken<{ id: number; exp: number }>("trusted", (await cookies()).get(TRUSTED_COOKIE)?.value);
  return trusted?.id === adminId;
}
