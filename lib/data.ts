import "server-only";
import { cache } from "react";
import { query, queryOne } from "./db";
import type {
  Activite,
  Actualite,
  Inscription,
  Medecin,
  Message,
  Patient,
  RendezVous,
  Service,
  StatutRdv,
  Temoignage,
} from "./types";

/* ------------------------------------------------------------------ */
/*  Public                                                            */
/* ------------------------------------------------------------------ */

const SERVICE_COLS = `s.*,
  (SELECT COUNT(*) FROM patients p WHERE p.service_id = s.id AND p.statut <> 'sorti') AS lits_occupes,
  (SELECT COUNT(*) FROM medecins m WHERE m.service_id = s.id) AS nb_medecins`;

export const getServices = cache(() =>
  query<Service>(`SELECT ${SERVICE_COLS} FROM services s ORDER BY s.id`),
);

export const getService = cache((slug: string) =>
  queryOne<Service>(`SELECT ${SERVICE_COLS} FROM services s WHERE s.slug = ?`, [slug]),
);

const MEDECIN_SELECT = `SELECT m.*, s.nom AS service_nom, s.slug AS service_slug, s.couleur
  FROM medecins m JOIN services s ON s.id = m.service_id`;

export const getMedecins = cache(() =>
  query<Medecin>(`${MEDECIN_SELECT} ORDER BY s.id, m.nom`),
);

export const getMedecinsByService = cache((serviceId: number) =>
  query<Medecin>(`${MEDECIN_SELECT} WHERE m.service_id = ? ORDER BY m.nom`, [serviceId]),
);

// Next occurrence (today included) of the activity's weekday.
// WEEKDAY(): 0 = Monday; the `jour` column: 1 = Monday.
const PROCHAINE_DATE = `DATE_ADD(CURDATE(), INTERVAL MOD(CAST(a.jour AS SIGNED) - 1 - WEEKDAY(CURDATE()) + 7, 7) DAY)`;

const ACTIVITE_SELECT = `SELECT a.*, ${PROCHAINE_DATE} AS prochaine_date,
  (SELECT COUNT(*) FROM inscriptions_activites i
     WHERE i.activite_id = a.id AND i.date_seance = ${PROCHAINE_DATE}) AS inscrits
  FROM activites a`;

export const getActivites = cache(() =>
  query<Activite>(`${ACTIVITE_SELECT} WHERE a.actif = 1 ORDER BY a.jour, a.heure_debut`),
);

export const getActivite = cache((id: number) =>
  queryOne<Activite>(`${ACTIVITE_SELECT} WHERE a.id = ? AND a.actif = 1`, [id]),
);

export const getActivitesDuJour = cache(() =>
  query<Activite>(
    `${ACTIVITE_SELECT} WHERE a.actif = 1 AND a.jour = WEEKDAY(CURDATE()) + 1 ORDER BY a.heure_debut`,
  ),
);

export const getActualites = cache((limit = 50) =>
  query<Actualite>(`SELECT * FROM actualites ORDER BY date_pub DESC, id DESC LIMIT ?`, [String(limit)]),
);

export const getActualite = cache((slug: string) =>
  queryOne<Actualite>(`SELECT * FROM actualites WHERE slug = ?`, [slug]),
);

export const getTemoignages = cache(() =>
  query<Temoignage>(`SELECT * FROM temoignages ORDER BY id`),
);

export interface PublicStats {
  services: number;
  medecins: number;
  activites: number;
  enfants_soignes: number;
  lits: number;
  dons_total: number;
}

export const getPublicStats = cache(async () => {
  const row = await queryOne<PublicStats>(`SELECT
    (SELECT COUNT(*) FROM services) AS services,
    (SELECT COUNT(*) FROM medecins) AS medecins,
    (SELECT COUNT(*) FROM activites WHERE actif = 1) AS activites,
    (SELECT COUNT(*) FROM patients) + (SELECT COUNT(*) FROM rendez_vous WHERE statut = 'termine') AS enfants_soignes,
    (SELECT COALESCE(SUM(lits_total), 0) FROM services) AS lits,
    (SELECT COALESCE(SUM(montant), 0) FROM dons) AS dons_total`);
  return row!;
});

export interface DonsParProjet {
  projet: string;
  total: number;
  nb: number;
}

export const getDonsParProjet = cache(() =>
  query<DonsParProjet>(
    `SELECT projet, SUM(montant) AS total, COUNT(*) AS nb FROM dons GROUP BY projet`,
  ),
);

export const getDerniersDons = cache(() =>
  query<{ nom: string | null; montant: number; projet: string; message: string | null; created_at: string }>(
    `SELECT nom, montant, projet, message, created_at FROM dons ORDER BY created_at DESC LIMIT 6`,
  ),
);

export { CRENEAUX } from "./constants";

export async function getCreneauxPris(medecinId: number, date: string): Promise<string[]> {
  const rows = await query<{ heure: string }>(
    `SELECT TIME_FORMAT(heure, '%H:%i') AS heure FROM rendez_vous
     WHERE medecin_id = ? AND date_rdv = ? AND statut IN ('en_attente','confirme')`,
    [medecinId, date],
  );
  return rows.map((r) => r.heure);
}

/** What the public tracking page is allowed to show (see getSuiviRendezVous). */
export type SuiviRendezVous = Pick<
  RendezVous,
  "reference" | "enfant_nom" | "enfant_age" | "service_nom" | "medecin_nom" | "date_rdv" | "heure" | "statut"
>;

/**
 * Appointment behind an 8-character reference, for the unauthenticated tracking page.
 *
 * Columns are listed one by one instead of reusing RDV_SELECT's `r.*`: that would hand a
 * public page the parent's e-mail and phone number and the reason for the visit, none of
 * which it displays. Nothing leaks today — a Server Component only sends what it renders —
 * but the row is one careless `<Component rdv={rdv} />` away from the browser, and the
 * reference alone is enough to request it.
 */
export const getSuiviRendezVous = (reference: string) =>
  queryOne<SuiviRendezVous>(
    `SELECT r.reference, r.enfant_nom, r.enfant_age, r.date_rdv, r.heure, r.statut,
       s.nom AS service_nom, CONCAT(m.titre, ' ', m.prenom, ' ', m.nom) AS medecin_nom
     FROM rendez_vous r
     JOIN services s ON s.id = r.service_id
     JOIN medecins m ON m.id = r.medecin_id
     WHERE r.reference = ?`,
    [reference],
  );

/* ------------------------------------------------------------------ */
/*  Administration                                                     */
/* ------------------------------------------------------------------ */

const RDV_SELECT = `SELECT r.*, s.nom AS service_nom, s.couleur,
  CONCAT(m.titre, ' ', m.prenom, ' ', m.nom) AS medecin_nom
  FROM rendez_vous r
  JOIN services s ON s.id = r.service_id
  JOIN medecins m ON m.id = r.medecin_id`;

export function getRendezVous(statut?: StatutRdv | "tous", q?: string) {
  const where: string[] = [];
  const params: string[] = [];
  if (statut && statut !== "tous") {
    where.push("r.statut = ?");
    params.push(statut);
  }
  if (q) {
    where.push("(r.enfant_nom LIKE ? OR r.parent_nom LIKE ? OR r.reference LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  return query<RendezVous>(
    `${RDV_SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY (r.date_rdv >= CURDATE()) DESC,
              CASE WHEN r.date_rdv >= CURDATE() THEN r.date_rdv END ASC,
              r.date_rdv DESC, r.heure ASC
     LIMIT 200`,
    params,
  );
}

export function getPatients(statut?: string, q?: string) {
  const where: string[] = [];
  const params: string[] = [];
  if (statut && statut !== "tous") {
    where.push("p.statut = ?");
    params.push(statut);
  } else if (!statut) {
    where.push("p.statut <> 'sorti'");
  }
  if (q) {
    where.push("(p.prenom LIKE ? OR p.nom LIKE ? OR p.chambre LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  return query<Patient>(
    `SELECT p.*, TIMESTAMPDIFF(YEAR, p.date_naissance, CURDATE()) AS age,
       s.nom AS service_nom, s.couleur,
       CONCAT(m.titre, ' ', m.prenom, ' ', m.nom) AS medecin_nom
     FROM patients p
     JOIN services s ON s.id = p.service_id
     LEFT JOIN medecins m ON m.id = p.medecin_id
     ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY FIELD(p.statut, 'observation', 'hospitalise', 'sorti'), p.date_admission DESC`,
    params,
  );
}

export function getMessages() {
  return query<Message>(`SELECT * FROM messages ORDER BY lu ASC, created_at DESC`);
}

export function getInscriptions() {
  return query<Inscription>(
    `SELECT i.*, a.titre AS activite_titre, a.emoji
     FROM inscriptions_activites i JOIN activites a ON a.id = i.activite_id
     WHERE i.date_seance >= CURDATE()
     ORDER BY i.date_seance, a.heure_debut`,
  );
}

export function getAllActivites() {
  return query<Activite>(`${ACTIVITE_SELECT} ORDER BY a.jour, a.heure_debut`);
}

export interface DashboardStats {
  hospitalises: number;
  observation: number;
  lits_total: number;
  rdv_aujourdhui: number;
  rdv_en_attente: number;
  messages_non_lus: number;
  inscriptions_semaine: number;
  dons_mois: number;
  medecins_dispo: number;
  medecins_total: number;
}

export async function getDashboardStats() {
  return (await queryOne<DashboardStats>(`SELECT
    (SELECT COUNT(*) FROM patients WHERE statut = 'hospitalise') AS hospitalises,
    (SELECT COUNT(*) FROM patients WHERE statut = 'observation') AS observation,
    (SELECT SUM(lits_total) FROM services) AS lits_total,
    (SELECT COUNT(*) FROM rendez_vous WHERE date_rdv = CURDATE() AND statut <> 'annule') AS rdv_aujourdhui,
    (SELECT COUNT(*) FROM rendez_vous WHERE statut = 'en_attente') AS rdv_en_attente,
    (SELECT COUNT(*) FROM messages WHERE lu = 0) AS messages_non_lus,
    (SELECT COUNT(*) FROM inscriptions_activites WHERE date_seance BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 6 DAY)) AS inscriptions_semaine,
    (SELECT COALESCE(SUM(montant), 0) FROM dons WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS dons_mois,
    (SELECT COUNT(*) FROM medecins WHERE disponible = 1) AS medecins_dispo,
    (SELECT COUNT(*) FROM medecins) AS medecins_total`))!;
}

export function getRdvParJour() {
  // Last 14 days + next 7, including days with no appointments
  return query<{ jour: string; total: number; annules: number }>(
    `WITH RECURSIVE jours AS (
       SELECT DATE_SUB(CURDATE(), INTERVAL 13 DAY) AS jour
       UNION ALL SELECT DATE_ADD(jour, INTERVAL 1 DAY) FROM jours WHERE jour < DATE_ADD(CURDATE(), INTERVAL 7 DAY)
     )
     SELECT DATE_FORMAT(j.jour, '%Y-%m-%d') AS jour,
            COUNT(CASE WHEN r.statut <> 'annule' THEN 1 END) AS total,
            COUNT(CASE WHEN r.statut = 'annule' THEN 1 END) AS annules
     FROM jours j LEFT JOIN rendez_vous r ON r.date_rdv = j.jour
     GROUP BY j.jour ORDER BY j.jour`,
  );
}

export function getRdvParStatut() {
  return query<{ statut: StatutRdv; total: number }>(
    `SELECT statut, COUNT(*) AS total FROM rendez_vous GROUP BY statut`,
  );
}
