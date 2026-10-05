// Jeton de session signé (HMAC-SHA256) — utilisable côté serveur et dans proxy.ts.
export const SESSION_COOKIE = "ph_session";
export const SESSION_DURATION_S = 60 * 60 * 8; // 8 h

export interface SessionPayload {
  id: number;
  email: string;
  nom: string;
  exp: number; // timestamp (s)
}

const encoder = new TextEncoder();

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET manquant ou trop court dans .env.local");
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

/** Signe un jeton typé : un jeton d'un type (ex. « code en attente ») n'est jamais accepté pour un autre. */
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
