import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Applies to every response.
 *
 * The Content-Security-Policy is deliberately *not* here: it needs a per-request nonce,
 * so proxy.ts issues it. These headers carry no per-request state, so serving them from
 * the static config costs nothing.
 */
const enTetesCommuns = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // frame-ancestors covers modern browsers; this covers the rest.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // For the Flash-era plugin readers that still ask; there is no policy file to find.
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=()",
  },
  // Cross-origin isolation of the browsing context, without blocking the Unsplash images.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // A package-lock.json exists in the user folder: pin the project root.
  turbopack: { root: __dirname },
  poweredByHeader: false,
  /*
   * The small white badge Next.js floats over the bottom-left of every page in `next dev`.
   * It is the dev-tools indicator, not part of the site, and it never shipped to production
   * anyway — but it sits on top of the content while the site is being looked at, so it is
   * off. Compile and runtime errors are still reported.
   */
  devIndicators: false,
  // Error pages and 404s should not echo the stack or the framework version.
  reactStrictMode: true,
  images: {
    // Site photo library (see lib/images.ts)
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
  },
  experimental: {
    // Optimized "barrel" imports: only the icons actually used are bundled.
    optimizePackageImports: ["lucide-react"],
    serverActions: {
      /*
       * Every form in this app is text, and the longest field anyone can legitimately
       * send is the 20 000-character body of a news article. The 1 MB default is three
       * orders of magnitude above that, and parsing it is work an unauthenticated caller
       * gets to ask for: a Server Action is a public POST endpoint.
       */
      bodySizeLimit: "256kb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...enTetesCommuns,
          // Sent only in production: on a plain-http deployment it would make the
          // browser refuse the site for two years. Drop it if you serve over http.
          ...(isDev
            ? []
            : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
        ],
      },
      {
        // Appointment slots depend on the caller's query and change constantly.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
