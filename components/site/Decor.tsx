// Understated decor, 100% CSS/SVG: subtle grid pattern, soft glow and hairlines.
// Nothing animated or illustrative — the photo carries the emotion, not the decor.

/** Very subtle, regular grid pattern, laid over dark fills or photos. */
export function Trame({ className = "" }: { className?: string }) {
  return <div className={`bg-grille pointer-events-none absolute inset-0 ${className}`} aria-hidden />;
}

/** Gradient overlay laid over a photo to guarantee text contrast. */
export function VoilePhoto({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 bg-linear-to-r from-marine via-marine/85 to-marine/40 ${className}`}
      aria-hidden
    />
  );
}

/** Blinking dot for "live" information (emergency room open…). */
export function Pastille({ className = "bg-corail" }: { className?: string }) {
  return (
    <span className="relative flex size-2" aria-hidden>
      <span className={`animate-pulse-ring absolute inline-flex size-full rounded-full ${className}`} />
      <span className={`relative inline-flex size-2 rounded-full ${className}`} />
    </span>
  );
}
