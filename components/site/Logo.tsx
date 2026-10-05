export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-corail to-soleil shadow-lg shadow-corail/30">
        <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
          {/* ourson + cœur */}
          <circle cx="9" cy="9" r="4.5" fill="#fff" />
          <circle cx="23" cy="9" r="4.5" fill="#fff" />
          <circle cx="16" cy="17" r="10" fill="#fff" />
          <circle cx="12.5" cy="15.5" r="1.4" fill="#1e2a4a" />
          <circle cx="19.5" cy="15.5" r="1.4" fill="#1e2a4a" />
          <path d="M16 24.5s-4-2.4-4-4.7a2 2 0 0 1 4-.6 2 2 0 0 1 4 .6c0 2.3-4 4.7-4 4.7z" fill="#ff6b6b" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block font-display text-lg font-semibold text-encre">Petits Héros</span>
        <span className="block text-[11px] font-bold tracking-wide text-brume uppercase">Hôpital pédiatrique</span>
      </span>
    </span>
  );
}
