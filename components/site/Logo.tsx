type Props = { className?: string; ton?: "sombre" | "clair" };

/**
 * Hospital mark: a health cross formed by a stylized heart.
 * `ton="clair"` for dark backgrounds (footer, photo headers).
 */
export function Logo({ className = "", ton = "sombre" }: Props) {
  const clair = ton === "clair";
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-lg ${
          clair ? "bg-white" : "bg-azur"
        }`}
      >
        <svg viewBox="0 0 32 32" className="size-6" aria-hidden>
          <path
            fill={clair ? "#1668b3" : "#ffffff"}
            d="M13 4h6v5.5a1 1 0 0 0 1 1h5.5v6H20a1 1 0 0 0-1 1V28h-6V17.5a1 1 0 0 0-1-1H6.5v-6H12a1 1 0 0 0 1-1z"
          />
          <path
            fill={clair ? "#0a2f58" : "#bfe0ff"}
            d="M16 28c-3.4-2.6-5.6-4.6-5.6-6.8a2.6 2.6 0 0 1 5.6-1.2 2.6 2.6 0 0 1 5.6 1.2c0 2.2-2.2 4.2-5.6 6.8z"
          />
        </svg>
      </span>
      <span className="leading-tight">
        <span
          className={`block font-display text-[15px] font-bold tracking-tight ${
            clair ? "text-white" : "text-encre"
          }`}
        >
          Little Heroes Hospital
        </span>
        <span
          className={`block text-[11px] font-medium tracking-wide ${
            clair ? "text-white/65" : "text-brume"
          }`}
        >
          Pediatric Hospital Center
        </span>
      </span>
    </span>
  );
}
