const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export const jourNom = (jour: number) => JOURS[(jour - 1 + 7) % 7];
export const JOURS_SEMAINE = JOURS;

/** "2026-10-01" → Date locale à midi (évite les décalages de fuseau). */
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

const fmtLong = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtCourt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const fmtJour = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" });

export const dateLongue = (d: string) => fmtLong.format(parseDate(d));
export const dateCourte = (d: string) => fmtCourt.format(parseDate(d));
export const dateJour = (d: string) => fmtJour.format(parseDate(d));

/** "14:30:00" → "14h30" */
export const heure = (t: string) => t.slice(0, 5).replace(":", "h");

export const euros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export const nombre = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

export function ilYA(datetime: string): string {
  const diff = (Date.now() - new Date(datetime.replace(" ", "T")).getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  const j = Math.floor(diff / 86400);
  return j === 1 ? "hier" : `il y a ${j} jours`;
}

export const STATUTS_RDV = {
  en_attente: { label: "En attente", cls: "bg-amber-100 text-amber-800" },
  confirme: { label: "Confirmé", cls: "bg-emerald-100 text-emerald-800" },
  annule: { label: "Annulé", cls: "bg-slate-200 text-slate-600" },
  termine: { label: "Terminé", cls: "bg-sky-100 text-sky-800" },
} as const;

export const STATUTS_PATIENT = {
  hospitalise: { label: "Hospitalisé", cls: "bg-violet-100 text-violet-800" },
  observation: { label: "En observation", cls: "bg-amber-100 text-amber-800" },
  sorti: { label: "Sorti", cls: "bg-slate-200 text-slate-600" },
} as const;
