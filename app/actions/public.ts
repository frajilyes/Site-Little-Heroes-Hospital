"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { RowDataPacket } from "mysql2/promise";
import { execute, isDuplicateError, queryOne, transaction } from "@/lib/db";
import { CRENEAUX } from "@/lib/constants";
import { PROJETS_DONS } from "@/lib/theme";
import { DATE, EMAIL, HEURE, TEL, validate } from "@/lib/validation";
import { dateLongue, heure as fmtHeure, parseDate, toISODate } from "@/lib/format";
import { creerCode, renvoyerCode, TropDeDemandes, verifierCode, type Verification } from "@/lib/codes";
import { mailRecapRdv, sendMail } from "@/lib/mail";
import type { FormState } from "@/lib/types";

const ERREUR_SERVEUR: FormState = {
  ok: false,
  message: "Oups, une erreur est survenue. Merci de réessayer dans un instant.",
};

function reference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(8), (b) => alphabet[b % alphabet.length]).join("");
}

/* ------------------------------ Rendez-vous ------------------------------ */

export async function prendreRendezVous(_prev: FormState, formData: FormData): Promise<FormState> {
  const { data, errors, ok } = validate(formData, {
    service_id: { label: "Le service", required: true, int: [1, 10_000] },
    medecin_id: { label: "Le médecin", required: true, int: [1, 10_000] },
    date_rdv: { label: "La date", required: true, pattern: DATE },
    heure: { label: "L'horaire", required: true, pattern: HEURE },
    enfant_nom: { label: "Le nom de l'enfant", required: true, min: 2, max: 120 },
    enfant_age: { label: "L'âge", required: true, int: [0, 18] },
    parent_nom: { label: "Le nom du parent", required: true, min: 2, max: 120 },
    email: { label: "L'e-mail", required: true, pattern: EMAIL, patternMsg: "Adresse e-mail invalide.", max: 160 },
    telephone: { label: "Le téléphone", required: true, pattern: TEL, patternMsg: "Numéro de téléphone invalide." },
    motif: { label: "Le motif", required: true, min: 5, max: 500 },
  });
  if (!ok) return { ok: false, message: "Merci de corriger les champs indiqués.", errors, data };

  if (!CRENEAUX.includes(data.heure)) return { ok: false, message: "Ce créneau n'existe pas.", data };

  const jour = parseDate(data.date_rdv);
  const today = parseDate(toISODate(new Date()));
  const max = new Date(today);
  max.setDate(max.getDate() + 90);
  if (jour <= today || jour > max || jour.getDay() === 0 || jour.getDay() === 6) {
    return {
      ok: false,
      message: "Choisissez un jour ouvré entre demain et les 3 prochains mois.",
      errors: { date_rdv: "Date indisponible." },
      data,
    };
  }

  try {
    const erreur = await verifierMedecin(Number(data.medecin_id), Number(data.service_id));
    if (erreur) return { ok: false, message: erreur, data };

    const pris = await queryOne(
      "SELECT 1 FROM rendez_vous WHERE medecin_id = ? AND date_rdv = ? AND heure = ? AND statut IN ('en_attente','confirme')",
      [Number(data.medecin_id), data.date_rdv, data.heure],
    );
    if (pris) return { ...CRENEAU_PRIS, data };

    // Le rendez-vous n'est créé qu'après saisie du code reçu : l'adresse e-mail est forcément valide.
    const email = data.email.toLowerCase();
    const jeton = await creerCode("rdv", email, { ...data, email });
    return { ok: true, message: `Code envoyé à ${email}.`, data: { ...data, jeton } };
  } catch (err) {
    if (err instanceof TropDeDemandes) return { ...TROP_DE_CODES, data };
    console.error(err);
    return { ...ERREUR_SERVEUR, data };
  }
}

/** Étape 2 : le code reçu par e-mail valide la demande, le rendez-vous est alors enregistré. */
export async function confirmerRendezVous(_prev: FormState, formData: FormData): Promise<FormState> {
  const verif = await verifierSaisie("rdv", formData);
  if (!verif.ok) return verif.state;
  const data = verif.donnees;

  try {
    const erreur = await verifierMedecin(Number(data.medecin_id), Number(data.service_id));
    if (erreur) return { ok: false, message: erreur };

    const ref = reference();
    await execute(
      `INSERT INTO rendez_vous (reference, enfant_nom, enfant_age, parent_nom, email, telephone, service_id, medecin_id, date_rdv, heure, motif)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ref,
        data.enfant_nom,
        Number(data.enfant_age),
        data.parent_nom,
        verif.email,
        data.telephone,
        Number(data.service_id),
        Number(data.medecin_id),
        data.date_rdv,
        data.heure,
        data.motif,
      ],
    );
    revalidatePath("/", "layout");
    await envoyerRecap(ref, verif.email, data);
    return { ok: true, message: "Rendez-vous enregistré !", data: { reference: ref } };
  } catch (err) {
    if (isDuplicateError(err)) return CRENEAU_PRIS;
    console.error(err);
    return ERREUR_SERVEUR;
  }
}

async function verifierMedecin(medecinId: number, serviceId: number): Promise<string | null> {
  const medecin = await queryOne<{ disponible: number }>("SELECT disponible FROM medecins WHERE id = ? AND service_id = ?", [
    medecinId,
    serviceId,
  ]);
  if (!medecin) return "Ce médecin n'exerce pas dans ce service.";
  if (!medecin.disponible) return "Ce médecin ne prend pas de rendez-vous actuellement.";
  return null;
}

/** E-mail récapitulatif : un échec d'envoi n'annule pas le rendez-vous. */
async function envoyerRecap(ref: string, email: string, data: Record<string, string>) {
  try {
    const info = await queryOne<{ medecin: string; service: string }>(
      `SELECT CONCAT(m.titre, ' ', m.prenom, ' ', m.nom) AS medecin, s.nom AS service
       FROM medecins m JOIN services s ON s.id = m.service_id WHERE m.id = ?`,
      [Number(data.medecin_id)],
    );
    await sendMail(
      mailRecapRdv(email, {
        reference: ref,
        parent: data.parent_nom,
        enfant: data.enfant_nom,
        quand: `${dateLongue(data.date_rdv)} à ${fmtHeure(data.heure)}`,
        medecin: info?.medecin ?? "",
        service: info?.service ?? "",
      }),
    );
  } catch (err) {
    console.error(err);
  }
}

/* ------------------------------ Codes reçus par e-mail ------------------------------ */

const CRENEAU_PRIS: FormState = {
  ok: false,
  message: "Ce créneau vient d'être réservé par une autre famille. Choisissez un autre horaire.",
  errors: { heure: "Créneau déjà pris." },
};

const TROP_DE_CODES: FormState = {
  ok: false,
  message: "Trop de codes ont été demandés pour cette adresse. Réessayez dans une heure.",
};

type Saisie = { ok: true; email: string; donnees: Record<string, string> } | { ok: false; state: FormState };

async function verifierSaisie(objet: "rdv" | "annulation", formData: FormData): Promise<Saisie> {
  const jeton = String(formData.get("jeton") ?? "");
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  if (code.length !== 6)
    return { ok: false, state: { ok: false, message: "Le code contient 6 chiffres.", errors: { code: "Code incomplet." } } };

  let verif: Verification;
  try {
    verif = await verifierCode(objet, jeton, code);
  } catch (err) {
    console.error(err);
    return { ok: false, state: ERREUR_SERVEUR };
  }
  if (verif.ok) return verif;
  return {
    ok: false,
    state:
      verif.raison === "invalide"
        ? { ok: false, message: "Code incorrect. Vérifiez l'e-mail reçu.", errors: { code: "Code incorrect." } }
        : { ok: false, message: "Ce code a expiré ou trop d'essais ont échoué. Demandez un nouveau code.", errors: { code: "Code expiré." } },
  };
}

export async function renvoyerCodeEmail(jeton: string): Promise<FormState> {
  try {
    const attente = await renvoyerCode(jeton);
    if (attente > 0) return { ok: false, message: `Patientez ${attente} s avant de demander un nouveau code.` };
    return { ok: true, message: "Un nouveau code vous a été envoyé." };
  } catch (err) {
    console.error(err);
    return { ok: false, message: "Impossible de renvoyer le code. Recommencez la démarche." };
  }
}

/* ------------------------------ Activités ------------------------------ */

export async function inscrireActivite(_prev: FormState, formData: FormData): Promise<FormState> {
  const { data, errors, ok } = validate(formData, {
    activite_id: { label: "L'activité", required: true, int: [1, 100_000] },
    enfant_nom: { label: "Le prénom de l'enfant", required: true, min: 2, max: 120 },
    age: { label: "L'âge", required: true, int: [0, 18] },
    chambre: { label: "La chambre", max: 20 },
    parent_nom: { label: "Le nom du parent", required: true, min: 2, max: 120 },
    telephone: { label: "Le téléphone", required: true, pattern: TEL, patternMsg: "Numéro de téléphone invalide." },
  });
  if (!ok) return { ok: false, message: "Merci de corriger les champs indiqués.", errors, data };

  try {
    const result = await transaction(async (conn) => {
      // Verrou sur l'activité : deux inscriptions simultanées ne peuvent pas dépasser la capacité.
      const [rows] = await conn.execute<RowDataPacket[]>(
        `SELECT id, titre, places, age_min, age_max,
           DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL MOD(CAST(jour AS SIGNED) - 1 - WEEKDAY(CURDATE()) + 7, 7) DAY), '%Y-%m-%d') AS date_seance
         FROM activites WHERE id = ? AND actif = 1 FOR UPDATE`,
        [Number(data.activite_id)],
      );
      const act = rows[0];
      if (!act) return { ok: false, message: "Activité introuvable." } as FormState;

      const age = Number(data.age);
      if (age < act.age_min || age > act.age_max) {
        return {
          ok: false,
          message: `Cette activité est prévue pour les ${act.age_min}-${act.age_max} ans.`,
          errors: { age: "Âge hors tranche." },
        } as FormState;
      }

      const [[{ inscrits }]] = await conn.execute<RowDataPacket[]>(
        "SELECT COUNT(*) AS inscrits FROM inscriptions_activites WHERE activite_id = ? AND date_seance = ?",
        [act.id, act.date_seance],
      );
      if (inscrits >= act.places) return { ok: false, message: "Désolé, cette séance est complète !" } as FormState;

      await conn.execute(
        `INSERT INTO inscriptions_activites (activite_id, date_seance, enfant_nom, age, chambre, parent_nom, telephone)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [act.id, act.date_seance, data.enfant_nom, age, data.chambre || null, data.parent_nom, data.telephone],
      );
      return {
        ok: true,
        message: `${data.enfant_nom} est inscrit(e) à « ${act.titre} » !`,
        data: { date_seance: act.date_seance },
      } as FormState;
    });
    if (result.ok) revalidatePath("/", "layout");
    return { ...result, data: { ...data, ...result.data } };
  } catch (err) {
    console.error(err);
    return { ...ERREUR_SERVEUR, data };
  }
}

/* ------------------------------ Contact ------------------------------ */

export async function envoyerMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const { data, errors, ok } = validate(formData, {
    nom: { label: "Le nom", required: true, min: 2, max: 120 },
    email: { label: "L'e-mail", required: true, pattern: EMAIL, patternMsg: "Adresse e-mail invalide.", max: 160 },
    sujet: { label: "Le sujet", required: true, min: 3, max: 200 },
    message: { label: "Le message", required: true, min: 10, max: 3000 },
  });
  if (!ok) return { ok: false, message: "Merci de corriger les champs indiqués.", errors, data };

  try {
    await execute("INSERT INTO messages (nom, email, sujet, message) VALUES (?, ?, ?, ?)", [
      data.nom,
      data.email.toLowerCase(),
      data.sujet,
      data.message,
    ]);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Message envoyé ! Notre équipe vous répondra sous 48 h." };
  } catch (err) {
    console.error(err);
    return { ...ERREUR_SERVEUR, data };
  }
}

/* ------------------------------ Dons ------------------------------ */

export async function faireDon(_prev: FormState, formData: FormData): Promise<FormState> {
  const { data, errors, ok } = validate(formData, {
    montant: { label: "Le montant", required: true, int: [5, 100_000] },
    projet: { label: "Le projet", required: true },
    nom: { label: "Le nom", max: 120 },
    email: { label: "L'e-mail", pattern: EMAIL, patternMsg: "Adresse e-mail invalide.", max: 160 },
    message: { label: "Le message", max: 500 },
  });
  if (!(data.projet in PROJETS_DONS)) errors.projet = "Projet inconnu.";
  if (!ok || errors.projet) return { ok: false, message: "Merci de corriger les champs indiqués.", errors, data };

  try {
    await execute("INSERT INTO dons (nom, email, montant, projet, message) VALUES (?, ?, ?, ?, ?)", [
      data.nom || null,
      data.email || null,
      Number(data.montant),
      data.projet,
      data.message || null,
    ]);
    revalidatePath("/", "layout");
    return { ok: true, message: "Merci infiniment pour votre générosité ! 💛", data: { montant: data.montant } };
  } catch (err) {
    console.error(err);
    return { ...ERREUR_SERVEUR, data };
  }
}

/* ------------------------------ Annulation par la famille ------------------------------ */

/** Étape 1 : vérifie la référence et l'e-mail, puis envoie un code à cette adresse. */
export async function demanderAnnulation(_prev: FormState, formData: FormData): Promise<FormState> {
  const { data, ok } = validate(formData, {
    reference: { label: "La référence", required: true, pattern: /^[A-Z0-9]{8}$/ },
    email: { label: "L'e-mail", required: true, pattern: EMAIL },
  });
  if (!ok) return { ok: false, message: "Référence ou e-mail invalide.", data };
  const email = data.email.toLowerCase();

  try {
    const rdv = await queryOne(
      `SELECT 1 FROM rendez_vous
       WHERE reference = ? AND email = ? AND statut IN ('en_attente','confirme') AND date_rdv >= CURDATE()`,
      [data.reference, email],
    );
    if (!rdv) return { ok: false, message: "Annulation impossible : vérifiez l'e-mail utilisé lors de la réservation.", data };

    // Seul le parent qui reçoit les e-mails de cette adresse peut annuler.
    const jeton = await creerCode("annulation", email, { reference: data.reference });
    return { ok: true, message: `Code envoyé à ${email}.`, data: { ...data, jeton } };
  } catch (err) {
    if (err instanceof TropDeDemandes) return { ...TROP_DE_CODES, data };
    console.error(err);
    return { ...ERREUR_SERVEUR, data };
  }
}

/** Étape 2 : le code reçu confirme l'annulation. */
export async function annulerRendezVous(_prev: FormState, formData: FormData): Promise<FormState> {
  const verif = await verifierSaisie("annulation", formData);
  if (!verif.ok) return verif.state;

  try {
    const res = await execute(
      `UPDATE rendez_vous SET statut = 'annule'
       WHERE reference = ? AND email = ? AND statut IN ('en_attente','confirme') AND date_rdv >= CURDATE()`,
      [verif.donnees.reference, verif.email],
    );
    if (res.affectedRows === 0) return { ok: false, message: "Ce rendez-vous ne peut plus être annulé." };
    revalidatePath("/", "layout");
    return { ok: true, message: "Votre rendez-vous a bien été annulé." };
  } catch (err) {
    console.error(err);
    return ERREUR_SERVEUR;
  }
}
