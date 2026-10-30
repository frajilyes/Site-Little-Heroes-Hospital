import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const isDev = process.env.NODE_ENV === "development";

/**
 * Strict Content-Security-Policy, applied to every page of the site.
 *
 * Inline scripts must carry this request's nonce, so injected markup cannot execute even
 * if it reaches the page: no 'unsafe-inline' anywhere in script-src. 'strict-dynamic' lets
 * the nonce-trusted Next.js bootstrap pull in the app's own chunks without listing them.
 *
 * The nonce is what forces every page to render per request — a prerendered page would
 * carry no nonce and the browser would block its own scripts. The four pages that used to
 * be prerendered therefore call `connection()` (see app/not-found.tsx and the brochure
 * pages); if a new page is ever prerendered and reachable here, it will break visibly
 * rather than silently lose its policy.
 *
 * Styles are split in two: `<style>` elements must carry the nonce, which Next.js adds to
 * the ones it generates, while 'unsafe-inline' is confined to style *attributes* — the one
 * place a nonce cannot reach. Injected markup can therefore still colour itself, but it
 * cannot ship a `<style>` block that restyles the page or reads attribute values back out
 * through selectors.
 */
function csp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    // The UI positions chart bars and progress fills with React style props.
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com",
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "media-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

/**
 * Builds the response for an allowed request, carrying the nonce both ways: Next.js reads
 * it from the *request* header to stamp its own script tags, and the browser enforces it
 * from the *response* header.
 */
function autoriser(request: NextRequest, prive: boolean): NextResponse {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const policy = csp(nonce);

  const enTetes = new Headers(request.headers);
  enTetes.set("x-nonce", nonce);
  enTetes.set("Content-Security-Policy", policy);

  const response = NextResponse.next({ request: { headers: enTetes } });
  response.headers.set("Content-Security-Policy", policy);
  if (prive) {
    // Patient records must not sit in a disk cache or a shared proxy, and must not come
    // back from session history after a logout.
    response.headers.set("Cache-Control", "no-store, must-revalidate");
  }
  return response;
}

/**
 * Same-origin check for anything that can change state.
 *
 * Next.js already compares Origin to Host for Server Actions, but it lets a request with
 * no Origin header through with a warning. Browsers always send Origin on POST, so a
 * missing one means the caller is not a browser form — and every mutation in this app,
 * public forms included, is a Server Action, so there is no reason to accept it.
 */
function origineValide(request: NextRequest): boolean {
  if (request.method === "GET" || request.method === "HEAD") return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const attendu = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return !!attendu && new URL(origin).host === attendu;
  } catch {
    return false;
  }
}

/**
 * Pages that render someone's personal data and must not be left in a disk cache or a
 * shared proxy. The staff area is all of it; on the public site the appointment tracking
 * page shows a child's name and consultation to whoever holds the reference.
 */
function estPrive(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/rendez-vous/suivi";
}

// Optimistic check: the real authorization is redone in every page / action (requireAdmin).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Before anything else, and whatever the path: a booking, a message or a donation
  // submitted from another site is as unwanted as a staff action.
  if (!origineValide(request)) {
    return new NextResponse("Cross-origin request refused.", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  // Route handlers answer with JSON, not a document: there is no markup for a policy to
  // govern and no nonce to hand to the renderer. They are in the matcher for the check
  // above, so a handler added later is not open to cross-site writes by default.
  if (pathname === "/api" || pathname.startsWith("/api/")) return NextResponse.next();

  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (!admin) return autoriser(request, estPrive(pathname));

  // The two pages a staff member must reach without a session: the login (and its code
  // step) and the first-account form, which is itself closed as soon as an account exists.
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/") || pathname === "/admin/inscription")
    return autoriser(request, true);

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("from", pathname);
    const redirection = NextResponse.redirect(url);
    redirection.headers.set("Cache-Control", "no-store");
    return redirection;
  }
  return autoriser(request, true);
}

export const config = {
  matcher: [
    /*
     * Every path except the ones that need nothing from this file: Next.js build assets,
     * the image optimizer, and static files. The API routes are included — they get no
     * policy, but the same-origin check has to see them.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
