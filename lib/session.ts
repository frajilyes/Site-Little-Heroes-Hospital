// Signed session token (HMAC-SHA256) — usable server-side and in proxy.ts.

/**
 * `__Host-` tells the browser to refuse the cookie unless it is Secure, scoped to Path=/
 * and carries no Domain attribute. That last part is the point: without it, anything able
 * to set a cookie for a sibling or parent domain can overwrite the session cookie, and the
 * server cannot tell which one it received. The prefix requires Secure, which browsers
 * will not accept over plain http, so it is production-only.
 */
export const PREFIXE_COOKIE = process.env.NODE_ENV === "production" ? "__Host-" : "";

export const SESSION_COOKIE = `${PREFIXE_COOKIE}ph_session`;
export const SESSION_DURATION_S = 60 * 60 * 8; // 8 h

export interface SessionPayload {
  id: number;
  email: string;
  nom: string;
  exp: number; // timestamp (s)
}

const encoder = new TextEncoder();

/**
 * The signing key, or a hard failure. Never falls back to a default: an empty key still
 * produces a valid-looking HMAC, so every token the app ever issued would be forgeable
 * by anyone who guessed the secret was missing.
 */
export function secret(): string {
  const s = process.env.SESSION_SECRET;
  // 32 characters, not 16: this one key signs the staff session, the pending-2FA cookie,
  // the trusted-device cookie and every confirmation code in the database. Guessing it
  // forges all of them at once, and the cost of a long one is nil.
  if (!s || s.length < 32) throw new Error("SESSION_SECRET missing or shorter than 32 characters");
  return s;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey() {
  return crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

/** Signs a typed token: a token of one type (e.g. "pending code") is never accepted for another. */
export async function signToken<T extends { exp: number }>(typ: string, payload: T): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify({ ...payload, typ })));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifyToken<T extends { exp: number }>(typ: string, token: string | undefined): Promise<T | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      fromBase64Url(sig) as BufferSource,
      encoder.encode(body),
    );
    if (!valid) return null;
    const { typ: actual, ...payload } = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as T & { typ?: string };
    if (actual !== typ) return null;
    return payload.exp > Date.now() / 1000 ? (payload as unknown as T) : null;
  } catch {
    return null;
  }
}

export const signSession = (payload: SessionPayload) => signToken("session", payload);
export const verifySession = (token: string | undefined) => verifyToken<SessionPayload>("session", token);
