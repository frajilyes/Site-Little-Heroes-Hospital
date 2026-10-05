// Décors 100 % CSS/SVG (aucun JS) : nuages, ballons, étoiles, blobs.

export function Cloud({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 60" className={className} style={style} aria-hidden>
      <path
        fill="white"
        d="M30 55h65a22 22 0 0 0 2-44 28 28 0 0 0-52-4A20 20 0 0 0 12 30a13 13 0 0 0 18 25z"
      />
    </svg>
  );
}

export function Clouds() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Cloud className="absolute top-[8%] w-32 opacity-90 animate-drift" style={{ animationDuration: "55s" }} />
      <Cloud className="absolute top-[30%] w-20 opacity-70 animate-drift" style={{ animationDuration: "70s", animationDelay: "-30s" }} />
      <Cloud className="absolute top-[18%] w-24 opacity-80 animate-drift" style={{ animationDuration: "48s", animationDelay: "-12s" }} />
    </div>
  );
}

export function Balloon({ color, className = "", delay = "0s" }: { color: string; className?: string; delay?: string }) {
  return (
    <svg viewBox="0 0 40 90" className={`animate-float ${className}`} style={{ animationDelay: delay }} aria-hidden>
      <path d="M20 52c0 10-6 14-4 24s6 10 4 14" stroke="#1e2a4a" strokeOpacity=".25" strokeWidth="1.2" fill="none" />
      <ellipse cx="20" cy="24" rx="17" ry="22" fill={color} />
      <path d="M17 46l3 6 3-6z" fill={color} />
      <ellipse cx="13" cy="15" rx="4" ry="7" fill="white" opacity=".35" transform="rotate(-20 13 15)" />
    </svg>
  );
}

export function Star({ className = "", color = "#ffc93c" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill={color}
        d="M12 2.5l2.6 6 6.4.6-4.9 4.3 1.5 6.3L12 16.4l-5.6 3.3 1.5-6.3L3 9.1l6.4-.6z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Blob({ className = "" }: { className?: string }) {
  return <div className={`pointer-events-none absolute animate-blob blur-2xl ${className}`} aria-hidden />;
}

export function Wave({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      className={`block w-full ${flip ? "rotate-180" : ""} ${className}`}
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path fill="currentColor" d="M0 40c160-30 320-40 480-20s320 50 480 40 320-40 480-30v50H0z" />
    </svg>
  );
}
