// Illustration vectorielle de l'hôpital (aucune image à télécharger).
export function HospitalIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 420" className={className} role="img" aria-label="Illustration de l'hôpital des Petits Héros">
      <defs>
        <linearGradient id="hi-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#bfe3ff" />
          <stop offset="1" stopColor="#e9f6ff" />
        </linearGradient>
        <linearGradient id="hi-wall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f3ece2" />
        </linearGradient>
      </defs>

      {/* ciel rond */}
      <circle cx="240" cy="220" r="200" fill="url(#hi-sky)" />
      {/* soleil */}
      <g className="origin-[392px_92px] animate-spin-slow">
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x="389" y="46" width="6" height="16" rx="3" fill="#ffc93c" transform={`rotate(${i * 45} 392 92)`} />
        ))}
      </g>
      <circle cx="392" cy="92" r="26" fill="#ffc93c" />
      <circle cx="384" cy="88" r="3" fill="#1e2a4a" />
      <circle cx="400" cy="88" r="3" fill="#1e2a4a" />
      <path d="M383 99q9 8 18 0" stroke="#1e2a4a" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* colline */}
      <ellipse cx="240" cy="400" rx="230" ry="60" fill="#8fe3c4" />
      <ellipse cx="120" cy="395" rx="120" ry="40" fill="#6fd6b0" />

      {/* bâtiment principal */}
      <rect x="140" y="130" width="200" height="240" rx="22" fill="url(#hi-wall)" stroke="#1e2a4a" strokeOpacity=".08" strokeWidth="2" />
      {/* toit arrondi */}
      <path d="M130 140q110-70 220 0" fill="#ff6b6b" />
      {/* croix + cœur */}
      <circle cx="240" cy="110" r="30" fill="#fff" stroke="#ffd4d4" strokeWidth="4" />
      <path d="M240 126s-16-9.6-16-18.8a8 8 0 0 1 16-2.4 8 8 0 0 1 16 2.4c0 9.2-16 18.8-16 18.8z" fill="#ff6b6b">
        <animateTransform attributeName="transform" type="scale" values="1;1.08;1" dur="1.4s" repeatCount="indefinite" additive="sum" />
      </path>

      {/* ailes */}
      <rect x="70" y="220" width="80" height="150" rx="18" fill="#fff" stroke="#1e2a4a" strokeOpacity=".08" strokeWidth="2" />
      <rect x="330" y="200" width="90" height="170" rx="18" fill="#fff" stroke="#1e2a4a" strokeOpacity=".08" strokeWidth="2" />
      <rect x="70" y="214" width="80" height="16" rx="8" fill="#4aa8ff" />
      <rect x="330" y="194" width="90" height="16" rx="8" fill="#9b8cff" />

      {/* fenêtres colorées */}
      {[
        [165, 170, "#ffc93c"], [215, 170, "#4aa8ff"], [265, 170, "#3ccfa5"], [315, 170, "#9b8cff"],
        [165, 230, "#4aa8ff"], [215, 230, "#ff6b6b"], [265, 230, "#ffc93c"], [315, 230, "#4aa8ff"],
        [165, 290, "#3ccfa5"], [315, 290, "#ffc93c"],
      ].map(([x, y, c], i) => (
        <g key={i}>
          <rect x={(x as number) - 14} y={y as number} width="28" height="32" rx="8" fill={c as string} opacity=".85" />
          <rect x={(x as number) - 14} y={y as number} width="28" height="12" rx="6" fill="#fff" opacity=".35" />
        </g>
      ))}
      {[[95, 250], [125, 250], [95, 300], [125, 300], [355, 230], [395, 230], [355, 285], [395, 285]].map(([x, y], i) => (
        <rect key={i} x={x - 10} y={y} width="20" height="26" rx="6" fill={i % 2 ? "#ffd59a" : "#bfe3ff"} />
      ))}

      {/* porte */}
      <rect x="212" y="300" width="56" height="70" rx="16" fill="#4aa8ff" />
      <rect x="238" y="300" width="4" height="70" fill="#fff" opacity=".6" />
      <rect x="198" y="292" width="84" height="12" rx="6" fill="#ff6b6b" />

      {/* arbres */}
      <circle cx="50" cy="350" r="28" fill="#3ccfa5" />
      <rect x="46" y="360" width="8" height="30" rx="4" fill="#b98b5e" />
      <circle cx="440" cy="355" r="24" fill="#3ccfa5" />
      <rect x="436" y="362" width="8" height="28" rx="4" fill="#b98b5e" />

      {/* ballon qui flotte */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -14; 0 0" dur="4s" repeatCount="indefinite" />
        <path d="M100 150q-6 30 4 60" stroke="#1e2a4a" strokeOpacity=".3" strokeWidth="1.5" fill="none" />
        <ellipse cx="100" cy="130" rx="18" ry="22" fill="#ff6b6b" />
        <ellipse cx="94" cy="122" rx="4" ry="7" fill="#fff" opacity=".4" />
      </g>
    </svg>
  );
}
