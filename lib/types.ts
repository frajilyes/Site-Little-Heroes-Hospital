export type Couleur =
  | "rose"
  | "sky"
  | "red"
  | "amber"
  | "violet"
  | "indigo"
  | "emerald"
  | "teal";

export interface Service {
  id: number;
  slug: string;
  nom: string;
  accroche: string;
  description: string;
  icone: string;
  couleur: Couleur;
  etage: string;
  telephone: string;
  lits_total: number;
  urgence_24h: number;
  lits_occupes: number;
  nb_medecins: number;
}

export interface Medecin {
  id: number;
  prenom: string;
  nom: string;
  titre: string;
  specialite: string;
  service_id: number;
  service_nom: string;
  service_slug: string;
  couleur: Couleur;
  bio: string;
  experience_ans: number;
  langues: string;
  avatar: string;
  disponible: number;
}

export type CategorieActivite =
  | "art"
  | "musique"
  | "jeux"
  | "sport"
  | "lecture"
  | "animaux"
  | "clown"
  | "science"
  | "bien-etre";

export interface Activite {
  id: number;
  titre: string;
  description: string;
  categorie: CategorieActivite;
  age_min: number;
  age_max: number;
  lieu: string;
  jour: number;
  heure_debut: string;
  heure_fin: string;
  places: number;
  animateur: string;
  emoji: string;
  actif: number;
  /** inscrits pour la prochaine séance */
  inscrits: number;
  prochaine_date: string;
}

export interface Actualite {
  id: number;
  slug: string;
  titre: string;
  resume: string;
  contenu: string;
  categorie: string;
  emoji: string;
  couleur: Couleur;
  date_pub: string;
}

export interface Temoignage {
  id: number;
  auteur: string;
  role: string;
  texte: string;
  note: number;
  avatar: string;
}

export type StatutRdv = "en_attente" | "confirme" | "annule" | "termine";

export interface RendezVous {
  id: number;
  reference: string;
  enfant_nom: string;
  enfant_age: number;
  parent_nom: string;
  email: string;
  telephone: string;
  service_id: number;
  service_nom: string;
  couleur: Couleur;
  medecin_id: number;
  medecin_nom: string;
  date_rdv: string;
  heure: string;
  motif: string;
  statut: StatutRdv;
  created_at: string;
}

export type StatutPatient = "hospitalise" | "observation" | "sorti";

export interface Patient {
  id: number;
  prenom: string;
  nom: string;
  date_naissance: string;
  age: number;
  sexe: "F" | "M";
  groupe_sanguin: string | null;
  allergies: string | null;
  service_id: number;
  service_nom: string;
  couleur: Couleur;
  medecin_id: number | null;
  medecin_nom: string | null;
  chambre: string;
  date_admission: string;
  date_sortie_prevue: string | null;
  statut: StatutPatient;
  parent_nom: string;
  parent_tel: string;
}

export interface Message {
  id: number;
  nom: string;
  email: string;
  sujet: string;
  message: string;
  lu: number;
  created_at: string;
}

export interface Inscription {
  id: number;
  activite_id: number;
  activite_titre: string;
  emoji: string;
  date_seance: string;
  enfant_nom: string;
  age: number;
  chambre: string | null;
  parent_nom: string;
  telephone: string;
  created_at: string;
}

/** État renvoyé par les Server Actions de formulaire (useActionState). */
export interface FormState {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  data?: Record<string, string>;
}
