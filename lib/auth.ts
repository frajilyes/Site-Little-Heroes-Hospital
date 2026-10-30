import "server-only";
import { createHmac, randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { execute, queryOne, transaction } from "./db";
import { mailCodeVerification, sendMail } from "./mail";
import {
  PREFIXE_COOKIE,
  SESSION_COOKIE,
  SESSION_DURATION_S,
  secret,
  signSession,
  signToken,
  verifySession,
  verifyToken,
  type SessionPayload,
} from "./session";

type Cout = { N: number; r: number; p: number };

const scryptAsync = promisify(scrypt) as (
  pwd: string,
  salt: string,
  len: number,
  opts: Cout & { maxmem: number },
) => Promise<Buffer>;

// Key length produced by scripts/setup-db.mjs.
const KEY_LEN = 64;

/**
 * Cost for new hashes, and the ceiling for verifying old ones.
 *
 * 128 * N * r is ~67 MB of memory per verification, which is the point of scrypt: it makes
 * parallel guessing expensive in hardware. Node's default maxmem is 32 MB and would throw
 * on these parameters, so it is raised explicitly. That memory cost is also why the login
 * action is rate limited before it ever gets here.
 */
const COUT: Cout = { N: 2 ** 16, r: 8, p: 1 };
const MAXMEM = 192 * 1024 * 1024;

/** What Node used by default, for hashes written before the parameters were recorded. */
const COUT_HERITE: Cout = { N: 16384, r: 8, p: 1 };

/** Serialized as scrypt$N$r$p$salt$hash so the cost can be raised without locking anyone out. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, KEY_LEN, { ...COUT, maxmem: MAXMEM });
  return `scrypt$${COUT.N}$${COUT.r}$${COUT.p}$${salt}$${hash.toString("hex")}`;
}

/**
 * A hash no password can satisfy, in the current format. Lets a login for an address that
 * does not exist spend the same work as one that does — see the decoy in login().
 */
export const HASH_LEURRE = `scrypt$${COUT.N}$${COUT.r}$${COUT.p}$${"00".repeat(16)}$${"00".repeat(KEY_LEN)}`;

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  let cout: Cout;
  let salt: string;
  let hash: string;

  if (parts.length === 6) {
    const [algo, N, r, p, s, h] = parts;
    if (algo !== "scrypt") return false;
    cout = { N: Number(N), r: Number(r), p: Number(p) };
    [salt, hash] = [s, h];
    // Bounded before use: the parameters decide how much memory scrypt allocates, so a
    // corrupted row must not be able to ask for gigabytes.
    if (!Number.isInteger(cout.N) || cout.N < 2 ** 12 || cout.N > COUT.N) return false;
    if (!Number.isInteger(cout.r) || cout.r < 1 || cout.r > 16) return false;
    if (!Number.isInteger(cout.p) || cout.p < 1 || cout.p > 4) return false;
  } else if (parts.length === 3) {
    const [algo, s, h] = parts;
    if (algo !== "scrypt") return false;
    [cout, salt, hash] = [COUT_HERITE, s, h];
  } else {
    return false;
  }
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  // The length is checked against the constant, never derived from the stored value: a
  // truncated or non-hex hash decodes to fewer bytes, and comparing two equally short
  // buffers would accept any password.
  if (expected.length !== KEY_LEN) return false;
  const actual = await scryptAsync(password, salt, KEY_LEN, { ...cout, maxmem: MAXMEM });
  return timingSafeEqual(expected, actual);
}

export async function createSession(user: Omit<SessionPayload, "exp">) {
  const token = await signSession({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_S });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(SESSION_DURATION_S));
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * The staff member behind the session cookie, or null.
 *
 * The cookie is signed and carries its own expiry, but nothing inside it can say that the
 * account was removed since it was issued — so the row is re-read here, and a revoked
 * admin loses access on the next request instead of keeping it for the rest of the 8 h.
 * `cache` keeps that to one primary-key lookup per request, shared by every page, layout
 * and action that asks.
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const admin = await queryOne<{ id: number }>("SELECT id FROM admins WHERE id = ?", [session.id]);
  return admin ? session : null;
});

/** Call in every admin page and Server Action. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/* ------------------------- First staff account (registration) ------------------------- */

/**
 * Whether the registration form is open: only for as long as no staff account exists.
 *
 * `npm run db:setup` normally creates that first account from the env file, and this form
 * is the path for an installation where it never ran. It has to close the moment an
 * account exists, otherwise the staff area would be open to whoever finds the URL — so
 * there is no open sign-up here, only a bootstrap.
 */
export const inscriptionOuverte = cache(async (): Promise<boolean> => {
  const row = await queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM admins");
  // An unreadable count is treated as "an account exists": the safe direction to fail.
  return Number(row?.n ?? 1) === 0;
});

/**
 * Creates that first account, or refuses because one appeared in the meantime.
 *
 * The check and the insert are one transaction, and it is the *read* that takes the lock:
 * on an empty InnoDB table `FOR UPDATE` holds a gap lock, so two registrations submitted
 * at the same moment are serialized — the second waits here, then sees the row and is
 * refused. Trusting `inscriptionOuverte()` alone would let both of them through, and the
 * unique index on the address only catches the case where they used the same one.
 *
 * Returns the id of the new account, or null if the registration is closed.
 */
export async function creerPremierAdmin(email: string, nom: string, passwordHash: string): Promise<number | null> {
  return transaction(async (conn) => {
    const [existants] = await conn.execute<RowDataPacket[]>("SELECT id FROM admins LIMIT 1 FOR UPDATE");
    if (existants.length > 0) return null;
    const [res] = await conn.execute<ResultSetHeader>(
      "INSERT INTO admins (email, nom, password_hash) VALUES (?, ?, ?)",
      [email, nom, passwordHash],
    );
    return res.insertId;
  });
}

/* ------------------------- Two-step verification (code by e-mail) ------------------------- */

const PENDING_COOKIE = `${PREFIXE_COOKIE}ph_2fa`;
const TRUSTED_COOKIE = `${PREFIXE_COOKIE}ph_trusted`;
export const CODE_DURATION_MIN = 10;
export const RESEND_DELAY_S = 60;
const MAX_ATTEMPTS = 5;
const TRUSTED_DURATION_S = 60 * 60 * 24 * 30; // 30 days

/** Identity known by the password, pending the code received by e-mail. */
export interface PendingLogin {
  id: number;
  email: string;
  nom: string;
  from: string;
  exp: number;
}

/**
 * Options shared by all three staff cookies (session, pending 2FA, trusted device).
 *
 * `strict` rather than `lax`: the staff area is only ever reached from inside the site, so
 * there is no flow that needs the cookie on a cross-site navigation, and strict keeps the
 * browser from attaching it to a request another site initiated. `path: "/"` and `secure`
 * are also what the `__Host-` prefix on the cookie names requires.
 */
const cookieOptions = (maxAge: number) =>
  ({ httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge }) as const;

// The code is never stored in plain text: HMAC bound to the admin.
const hashCode = (adminId: number, code: string) =>
  createHmac("sha256", secret()).update(`${adminId}:${code}`).digest("hex");

export const getPendingLogin = cache(async () =>
  verifyToken<PendingLogin>("2fa", (await cookies()).get(PENDING_COOKIE)?.value),
);

export async function clearPendingLogin() {
  (await cookies()).delete(PENDING_COOKIE);
}

/** Generates a 6-digit code, stores it (replacing the previous one), and sends it by e-mail. */
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

/** Seconds remaining before a new code can be requested (0 = allowed now). */
export async function resendCooldown(adminId: number): Promise<number> {
  const row = await queryOne<{ attente: number }>(
    "SELECT GREATEST(0, ? - TIMESTAMPDIFF(SECOND, created_at, NOW())) AS attente FROM admin_codes WHERE admin_id = ?",
    [RESEND_DELAY_S, adminId],
  );
  return Number(row?.attente ?? 0);
}

export type CodeCheck = "ok" | "invalide" | "expire";

/** Verifies the entered code: 5 attempts maximum, single use. */
export async function checkVerificationCode(adminId: number, code: string): Promise<CodeCheck> {
  // The counter is incremented before the comparison: impossible to exceed the limit in parallel.
  const res = await execute(
    "UPDATE admin_codes SET tentatives = tentatives + 1 WHERE admin_id = ? AND tentatives < ? AND expires_at > NOW()",
    [adminId, MAX_ATTEMPTS],
  );
  if (res.affectedRows === 0) return "expire";

  const row = await queryOne<{ code_hash: string }>("SELECT code_hash FROM admin_codes WHERE admin_id = ?", [adminId]);
  if (!row) return "expire";
  const expected = Buffer.from(row.code_hash, "hex");
  const actual = Buffer.from(hashCode(adminId, code), "hex");
  // timingSafeEqual throws on differing lengths: an unreadable stored hash is a failed attempt.
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return "invalide";

  await execute("DELETE FROM admin_codes WHERE admin_id = ?", [adminId]);
  return "ok";
}

/**
 * Fingerprint of the credential a trusted-device cookie was issued against.
 *
 * Without it that cookie outlives everything for 30 days: changing the password after a
 * scare, or rotating a hash that leaked, would leave every browser that ticked the box
 * still able to skip the second factor. Deriving it through the HMAC keeps the stored hash
 * out of the cookie, and half the digest is far more than a collision needs.
 */
const empreinte = (passwordHash: string) =>
  createHmac("sha256", secret()).update(`trusted:${passwordHash}`).digest("hex").slice(0, 32);

/**
 * "Don't ask again on this device": skips the code for 30 days, for as long as the
 * password it was granted under is still the account's password.
 */
export async function trustDevice(adminId: number, passwordHash: string) {
  const token = await signToken("trusted", {
    id: adminId,
    emp: empreinte(passwordHash),
    exp: Math.floor(Date.now() / 1000) + TRUSTED_DURATION_S,
  });
  (await cookies()).set(TRUSTED_COOKIE, token, cookieOptions(TRUSTED_DURATION_S));
}

export async function isTrustedDevice(adminId: number, passwordHash: string): Promise<boolean> {
  const trusted = await verifyToken<{ id: number; emp?: string; exp: number }>(
    "trusted",
    (await cookies()).get(TRUSTED_COOKIE)?.value,
  );
  // A cookie from before the fingerprint existed has no `emp` and does not match: those
  // devices are asked for a code once more, which is the safe direction to fail.
  return !!trusted && trusted.id === adminId && trusted.emp === empreinte(passwordHash);
}
