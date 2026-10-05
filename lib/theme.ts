import type { CategorieActivite, Couleur } from "./types";

// Classes Tailwind écrites en entier pour qu'elles soient détectées à la compilation.
export const COULEURS: Record<Couleur, { bg: string; soft: string; text: string; ring: string; grad: string; dot: string }> = {
  rose:    { bg: "bg-rose-500",    soft: "bg-rose-100",    text: "text-rose-600",    ring: "ring-rose-200",    grad: "from-rose-400 to-pink-500",      dot: "#f43f5e" },
  sky:     { bg: "bg-sky-500",     soft: "bg-sky-100",     text: "text-sky-600",     ring: "ring-sky-200",     grad: "from-sky-400 to-blue-500",       dot: "#0ea5e9" },
  red:     { bg: "bg-red-500",     soft: "bg-red-100",     text: "text-red-600",     ring: "ring-red-200",     grad: "from-red-400 to-rose-500",       dot: "#ef4444" },
  amber:   { bg: "bg-amber-500",   soft: "bg-amber-100",   text: "text-amber-700",   ring: "ring-amber-200",   grad: "from-amber-300 to-orange-500",   dot: "#f59e0b" },
  violet:  { bg: "bg-violet-500",  soft: "bg-violet-100",  text: "text-violet-600",  ring: "ring-violet-200",  grad: "from-violet-400 to-purple-500",  dot: "#8b5cf6" },
  indigo:  { bg: "bg-indigo-500",  soft: "bg-indigo-100",  text: "text-indigo-600",  ring: "ring-indigo-200",  grad: "from-indigo-400 to-blue-600",    dot: "#6366f1" },
  emerald: { bg: "bg-emerald-500", soft: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200", grad: "from-emerald-400 to-teal-500",   dot: "#10b981" },
  teal:    { bg: "bg-teal-500",    soft: "bg-teal-100",    text: "text-teal-700",    ring: "ring-teal-200",    grad: "from-teal-400 to-cyan-500",      dot: "#14b8a6" },
};

export const CATEGORIES: Record<CategorieActivite, { label: string; couleur: Couleur }> = {
  art:         { label: "Arts créatifs", couleur: "rose" },
  musique:     { label: "Musique",       couleur: "violet" },
  jeux:        { label: "Jeux",          couleur: "amber" },
  sport:       { label: "Sport",         couleur: "emerald" },
  lecture:     { label: "Lecture",       couleur: "indigo" },
  animaux:     { label: "Animaux",       couleur: "teal" },
  clown:       { label: "Clowns & magie", couleur: "red" },
  science:     { label: "Sciences",      couleur: "sky" },
  "bien-etre": { label: "Bien-être",     couleur: "emerald" },
};

export const PROJETS_DONS: Record<string, { label: string; objectif: number; emoji: string; couleur: Couleur; description: string }> = {
  "salle-jeux":     { label: "Salles de jeux",        objectif: 5000,  emoji: "🧸", couleur: "amber",  description: "Jouets, consoles et aménagement des espaces de jeu de chaque étage." },
  recherche:        { label: "Recherche pédiatrique", objectif: 10000, emoji: "🔬", couleur: "violet", description: "Financer les essais cliniques contre les cancers et maladies rares de l'enfant." },
  clowns:           { label: "Docteurs clowns",       objectif: 2000,  emoji: "🤡", couleur: "rose",   description: "Offrir des visites de clowns professionnels dans tous les services." },
  "maison-parents": { label: "Maison des parents",    objectif: 6000,  emoji: "🏡", couleur: "sky",    description: "Héberger gratuitement les familles qui viennent de loin." },
};
