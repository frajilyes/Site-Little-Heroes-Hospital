const JOURS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const jourNom = (jour: number) => JOURS[(jour - 1 + 7) % 7];
export const JOURS_SEMAINE = JOURS;

/** "2026-10-01" → local Date at noon (avoids timezone shifts). */
export function parseDate(d: string): Date {
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, day, 12);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const fmtLong = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtCourt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const fmtJour = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });

export const dateLongue = (d: string) => fmtLong.format(parseDate(d));
export const dateCourte = (d: string) => fmtCourt.format(parseDate(d));
export const dateJour = (d: string) => fmtJour.format(parseDate(d));

/** "14:30:00" → "14:30" */
export const heure = (t: string) => t.slice(0, 5);

export const euros = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export const nombre = (n: number) => new Intl.NumberFormat("en-GB").format(n);

export function ilYA(datetime: string): string {
  const diff = (Date.now() - new Date(datetime.replace(" ", "T")).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  const j = Math.floor(diff / 86400);
  return j === 1 ? "yesterday" : `${j} days ago`;
}

export const STATUTS_RDV = {
  en_attente: { label: "Pending", cls: "bg-amber-100 text-amber-800" },
  confirme: { label: "Confirmed", cls: "bg-emerald-100 text-emerald-800" },
  annule: { label: "Cancelled", cls: "bg-slate-200 text-slate-600" },
  termine: { label: "Completed", cls: "bg-sky-100 text-sky-800" },
} as const;

export const STATUTS_PATIENT = {
  hospitalise: { label: "Hospitalized", cls: "bg-violet-100 text-violet-800" },
  observation: { label: "Under observation", cls: "bg-amber-100 text-amber-800" },
  sorti: { label: "Discharged", cls: "bg-slate-200 text-slate-600" },
} as const;

/**
 * English plural suffix: `${n} spot${pluriel(n)}`.
 *
 * Everything but exactly one takes the "s" — zero included. Written out at each call site
 * as `n > 1`, which is the French rule, it rendered "0 practitioner" on a search that
 * matched nothing and "0 year old" for the babies the booking form explicitly accepts.
 */
export const pluriel = (n: number) => (n === 1 ? "" : "s");
