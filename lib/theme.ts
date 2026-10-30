import type { CategorieActivite, Couleur } from "./types";

// Tailwind classes written out in full so they're detected at build time.
// Palette deliberately desaturated: the site is still a healthcare facility —
// color identifies a department, it never merely decorates.
export const COULEURS: Record<Couleur, { bg: string; soft: string; text: string; ring: string; grad: string; dot: string }> = {
  rose:    { bg: "bg-rose-700",    soft: "bg-rose-50",    text: "text-rose-800",    ring: "ring-rose-200",    grad: "from-rose-900 to-rose-700",       dot: "#9f1239" },
  sky:     { bg: "bg-sky-700",     soft: "bg-sky-50",     text: "text-sky-800",     ring: "ring-sky-200",     grad: "from-sky-900 to-sky-700",         dot: "#075985" },
  red:     { bg: "bg-red-700",     soft: "bg-red-50",     text: "text-red-800",     ring: "ring-red-200",     grad: "from-red-900 to-red-700",         dot: "#991b1b" },
  amber:   { bg: "bg-amber-700",   soft: "bg-amber-50",   text: "text-amber-800",   ring: "ring-amber-200",   grad: "from-amber-900 to-amber-700",     dot: "#92400e" },
  violet:  { bg: "bg-violet-700",  soft: "bg-violet-50",  text: "text-violet-800",  ring: "ring-violet-200",  grad: "from-violet-900 to-violet-700",   dot: "#5b21b6" },
  indigo:  { bg: "bg-indigo-700",  soft: "bg-indigo-50",  text: "text-indigo-800",  ring: "ring-indigo-200",  grad: "from-indigo-900 to-indigo-700",   dot: "#3730a3" },
  emerald: { bg: "bg-emerald-700", soft: "bg-emerald-50", text: "text-emerald-800", ring: "ring-emerald-200", grad: "from-emerald-900 to-emerald-700", dot: "#065f46" },
  teal:    { bg: "bg-teal-700",    soft: "bg-teal-50",    text: "text-teal-800",    ring: "ring-teal-200",    grad: "from-teal-900 to-teal-700",       dot: "#115e59" },
};

export const CATEGORIES: Record<CategorieActivite, { label: string; couleur: Couleur; icone: string }> = {
  art:         { label: "Creative arts",  couleur: "rose",    icone: "palette" },
  musique:     { label: "Music",          couleur: "violet",  icone: "music" },
  jeux:        { label: "Games",          couleur: "amber",   icone: "dices" },
  sport:       { label: "Sport",          couleur: "emerald", icone: "activity" },
  lecture:     { label: "Reading",        couleur: "indigo",  icone: "book-open" },
  animaux:     { label: "Animal therapy", couleur: "teal",    icone: "dog" },
  clown:       { label: "Clowns & magic", couleur: "red",     icone: "theater" },
  science:     { label: "Science",        couleur: "sky",     icone: "flask" },
  "bien-etre": { label: "Wellbeing",      couleur: "emerald", icone: "sparkle" },
};

export const PROJETS_DONS: Record<string, { label: string; objectif: number; icone: string; couleur: Couleur; description: string }> = {
  "salle-jeux":     { label: "Playrooms",             objectif: 5000,  icone: "dices",      couleur: "amber",  description: "Toys, consoles, and fitting out the play areas on every floor." },
  recherche:        { label: "Pediatric research",    objectif: 10000, icone: "microscope", couleur: "violet", description: "Funding clinical trials against childhood cancers and rare diseases." },
  clowns:           { label: "Clown doctors",         objectif: 2000,  icone: "theater",    couleur: "rose",   description: "Bringing professional clown visits to every department." },
  "maison-parents": { label: "Parents' house",        objectif: 6000,  icone: "home",       couleur: "sky",    description: "Hosting families who travel from far away, free of charge." },
};
