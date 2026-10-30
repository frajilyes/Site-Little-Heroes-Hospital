"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { RowDataPacket } from "mysql2/promise";
import { execute, isDuplicateError, queryOne, transaction } from "@/lib/db";
import { CRENEAUX } from "@/lib/constants";
import { PROJETS_DONS } from "@/lib/theme";
import { adresseClient, delai, limiter } from "@/lib/rate-limit";
import { EMAIL, HEURE, TEL, validate } from "@/lib/validation";
import { dateLongue, heure as fmtHeure, parseDate, toISODate } from "@/lib/format";
import { creerCode, renvoyerCode, TropDeDemandes, verifierCode, type Verification } from "@/lib/codes";
import { mailRecapRdv, sendMail } from "@/lib/mail";
import type { FormState } from "@/lib/types";

const ERREUR_SERVEUR: FormState = {
  ok: false,
  message: "Oops, something went wrong. Please try again in a moment.",
};

const DEMANDE_INVALIDE: FormState = { ok: false, message: "Invalid request." };

function reference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(8), (b) => alphabet[b % alphabet.length]).join("");
}

/**
 * Per-caller ceiling for the public forms.
 *
 * The code ceiling in lib/codes.ts counts per e-mail address, which does nothing against
 * a script that changes the address it submits each time — that path still costs us a
 * database write and an outbound e-mail per attempt, and outbound spam is what gets a
 * mail domain blocklisted. These limits cap what one caller can push through at all.
 *
 * Returns the message to send back, or null to carry on.
 */
async function tropDeTrafic(nom: string, max: number, fenetreS: number): Promise<FormState | null> {
  const limite = limiter(`${nom}:${await adresseClient()}`, max, fenetreS);
  if (limite.ok) return null;
  return { ok: false, message: `Too many attempts. Please try again in ${delai(limite.retryAfter)}.` };
}

/* ------------------------------ Appointments ------------------------------ */

export async function prendreRendezVous(_prev: FormState, formData: FormData): Promise<FormState> {
  const { data, errors, ok } = validate(formData, {
    service_id: { label: "Department", required: true, int: [1, 10_000] },
    medecin_id: { label: "Doctor", required: true, int: [1, 10_000] },
    date_rdv: { label: "Date", required: true, date: true },
    heure: { label: "Time", required: true, pattern: HEURE },
    enfant_nom: { label: "Child's name", required: true, min: 2, max: 120 },
    enfant_age: { label: "Age", required: true, int: [0, 18] },
    parent_nom: { label: "Parent's name", required: true, min: 2, max: 120 },
    email: { label: "Email", required: true, pattern: EMAIL, patternMsg: "Invalid email address.", max: 160 },
    telephone: { label: "Phone number", required: true, pattern: TEL, patternMsg: "Invalid phone number." },
    motif: { label: "Reason", required: true, min: 5, max: 500 },
  });
  if (!ok) return { ok: false, message: "Please correct the fields indicated.", errors, data };

  // Each accepted request sends an e-mail: throttled before anything is written or sent.
  const trop = await tropDeTrafic("rdv", 10, 900);
  if (trop) return { ...trop, data };

  if (!CRENEAUX.includes(data.heure)) return { ok: false, message: "This time slot does not exist.", data };

  const jour = parseDate(data.date_rdv);
  const today = parseDate(toISODate(new Date()));
  const max = new Date(today);
  max.setDate(max.getDate() + 90);
  if (jour <= today || jour > max || jour.getDay() === 0 || jour.getDay() === 6) {
    return {
      ok: false,
      message: "Choose a weekday between tomorrow and the next 3 months.",
      errors: { date_rdv: "Date unavailable." },
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

    // The appointment is only created once the received code is entered: the email address is guaranteed valid.
    const email = data.email.toLowerCase();
    const jeton = await creerCode("rdv", email, { ...data, email });
    return { ok: true, message: `Code sent to ${email}.`, data: { ...data, jeton } };
  } catch (err) {
    if (err instanceof TropDeDemandes) return { ...TROP_DE_CODES, data };
    console.error(err);
    return { ...ERREUR_SERVEUR, data };
  }
}

/** Step 2: the code received by email validates the request, and the appointment is then saved. */
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
    return { ok: true, message: "Appointment booked!", data: { reference: ref } };
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
  if (!medecin) return "This doctor does not practice in this department.";
  if (!medecin.disponible) return "This doctor is not currently taking appointments.";
  return null;
}

/** Recap email: a delivery failure does not cancel the appointment. */
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
        quand: `${dateLongue(data.date_rdv)} at ${fmtHeure(data.heure)}`,
        medecin: info?.medecin ?? "",
        service: info?.service ?? "",
      }),
    );
  } catch (err) {
    console.error(err);
  }
}

/* ------------------------------ Codes received by email ------------------------------ */

const CRENEAU_PRIS: FormState = {
  ok: false,
  message: "This time slot was just booked by another family. Please choose another time.",
  errors: { heure: "Time slot already taken." },
};

const TROP_DE_CODES: FormState = {
  ok: false,
  message: "Too many codes have been requested for this address. Please try again in an hour.",
};

type Saisie = { ok: true; email: string; donnees: Record<string, string> } | { ok: false; state: FormState };

async function verifierSaisie(objet: "rdv" | "annulation", formData: FormData): Promise<Saisie> {
  const jeton = String(formData.get("jeton") ?? "");
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  if (code.length !== 6)
    return { ok: false, state: { ok: false, message: "The code has 6 digits.", errors: { code: "Incomplete code." } } };

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
        ? { ok: false, message: "Incorrect code. Check the email you received.", errors: { code: "Incorrect code." } }
        : { ok: false, message: "This code has expired or too many attempts failed. Request a new code.", errors: { code: "Code expired." } },
  };
}

export async function renvoyerCodeEmail(jeton: string): Promise<FormState> {
  // A Server Action argument is whatever the caller serialized, never a guaranteed string.
  if (typeof jeton !== "string" || jeton.length > 800) return DEMANDE_INVALIDE;

  // One outbound e-mail per call: throttled per caller, like the forms that create them.
  const trop = await tropDeTrafic("renvoi", 10, 900);
  if (trop) return trop;

  try {
    const attente = await renvoyerCode(jeton);
    if (attente > 0) return { ok: false, message: `Please wait ${attente}s before requesting a new code.` };
    return { ok: true, message: "A new code has been sent to you." };
  } catch (err) {
    if (err instanceof TropDeDemandes)
      return { ok: false, message: "Too many codes have been sent for this request. Please start over." };
    console.error(err);
    return { ok: false, message: "Could not resend the code. Please start over." };
  }
}

/* ------------------------------ Activities ------------------------------ */

export async function inscrireActivite(_prev: FormState, formData: FormData): Promise<FormState> {
  const { data, errors, ok } = validate(formData, {
    activite_id: { label: "Activity", required: true, int: [1, 100_000] },
    enfant_nom: { label: "Child's first name", required: true, min: 2, max: 120 },
    age: { label: "Age", required: true, int: [0, 18] },
    chambre: { label: "Room", max: 20 },
    parent_nom: { label: "Parent's name", required: true, min: 2, max: 120 },
    telephone: { label: "Phone number", required: true, pattern: TEL, patternMsg: "Invalid phone number." },
  });
  if (!ok) return { ok: false, message: "Please correct the fields indicated.", errors, data };

  const trop = await tropDeTrafic("activite", 20, 900);
  if (trop) return { ...trop, data };

  try {
    const result = await transaction(async (conn) => {
      // Lock on the activity: two simultaneous registrations cannot exceed capacity.
      const [rows] = await conn.execute<RowDataPacket[]>(
        `SELECT id, titre, places, age_min, age_max,
           DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL MOD(CAST(jour AS SIGNED) - 1 - WEEKDAY(CURDATE()) + 7, 7) DAY), '%Y-%m-%d') AS date_seance
         FROM activites WHERE id = ? AND actif = 1 FOR UPDATE`,
        [Number(data.activite_id)],
      );
      const act = rows[0];
      if (!act) return { ok: false, message: "Activity not found." } as FormState;

      const age = Number(data.age);
      if (age < act.age_min || age > act.age_max) {
        return {
          ok: false,
          message: `This activity is for ages ${act.age_min}-${act.age_max}.`,
          errors: { age: "Age out of range." },
        } as FormState;
      }

      const [[{ inscrits }]] = await conn.execute<RowDataPacket[]>(
        "SELECT COUNT(*) AS inscrits FROM inscriptions_activites WHERE activite_id = ? AND date_seance = ?",
        [act.id, act.date_seance],
      );
      if (inscrits >= act.places) return { ok: false, message: "Sorry, this session is full!" } as FormState;

      await conn.execute(
        `INSERT INTO inscriptions_activites (activite_id, date_seance, enfant_nom, age, chambre, parent_nom, telephone)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [act.id, act.date_seance, data.enfant_nom, age, data.chambre || null, data.parent_nom, data.telephone],
      );
      return {
        ok: true,
        message: `${data.enfant_nom} is registered for "${act.titre}"!`,
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
    nom: { label: "Name", required: true, min: 2, max: 120 },
    email: { label: "Email", required: true, pattern: EMAIL, patternMsg: "Invalid email address.", max: 160 },
    sujet: { label: "Subject", required: true, min: 3, max: 200 },
    message: { label: "Message", required: true, min: 10, max: 3000 },
  });
  if (!ok) return { ok: false, message: "Please correct the fields indicated.", errors, data };

  // The contact form is unauthenticated and lands in the staff inbox: keep it from
  // being usable as a flood channel.
  const trop = await tropDeTrafic("contact", 5, 900);
  if (trop) return { ...trop, data };

  try {
    await execute("INSERT INTO messages (nom, email, sujet, message) VALUES (?, ?, ?, ?)", [
      data.nom,
      data.email.toLowerCase(),
      data.sujet,
      data.message,
    ]);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Message sent! Our team will reply within 48 hours." };
  } catch (err) {
    console.error(err);
    return { ...ERREUR_SERVEUR, data };
  }
}

/* ------------------------------ Donations ------------------------------ */

export async function faireDon(_prev: FormState, formData: FormData): Promise<FormState> {
  const { data, errors, ok } = validate(formData, {
    montant: { label: "Amount", required: true, int: [5, 100_000] },
    projet: { label: "Project", required: true },
    nom: { label: "Name", max: 120 },
    email: { label: "Email", pattern: EMAIL, patternMsg: "Invalid email address.", max: 160 },
    message: { label: "Message", max: 500 },
  });
  // hasOwn, not `in`: `in` also matches inherited keys, so projet=toString would pass.
  if (!Object.hasOwn(PROJETS_DONS, data.projet)) errors.projet = "Unknown project.";
  if (!ok || errors.projet) return { ok: false, message: "Please correct the fields indicated.", errors, data };

  const trop = await tropDeTrafic("don", 10, 900);
  if (trop) return { ...trop, data };

  try {
    await execute("INSERT INTO dons (nom, email, montant, projet, message) VALUES (?, ?, ?, ?, ?)", [
      data.nom || null,
      data.email || null,
      Number(data.montant),
      data.projet,
      data.message || null,
    ]);
    revalidatePath("/", "layout");
    return { ok: true, message: "Thank you so much for your generosity! 💛", data: { montant: data.montant } };
  } catch (err) {
    console.error(err);
    return { ...ERREUR_SERVEUR, data };
  }
}

/* ------------------------------ Cancellation by the family ------------------------------ */

/** Step 1: verifies the reference and email, then sends a code to that address. */
export async function demanderAnnulation(_prev: FormState, formData: FormData): Promise<FormState> {
  const { data, ok } = validate(formData, {
    reference: { label: "Reference", required: true, pattern: /^[A-Z0-9]{8}$/ },
    email: { label: "Email", required: true, pattern: EMAIL, max: 160 },
  });
  if (!ok) return { ok: false, message: "Invalid reference or email.", data };

  // Each attempt probes one reference/address pair against the appointment table, so this
  // is the one public form where guessing is the point. Throttle it before the lookup.
  const trop = await tropDeTrafic("annulation", 10, 900);
  if (trop) return { ...trop, data };

  const email = data.email.toLowerCase();

  try {
    const rdv = await queryOne(
      `SELECT 1 FROM rendez_vous
       WHERE reference = ? AND email = ? AND statut IN ('en_attente','confirme') AND date_rdv >= CURDATE()`,
      [data.reference, email],
    );
    if (!rdv) return { ok: false, message: "Cancellation not possible: check the email used when booking.", data };

    // Only the parent who receives emails at this address can cancel.
    const jeton = await creerCode("annulation", email, { reference: data.reference });
    return { ok: true, message: `Code sent to ${email}.`, data: { ...data, jeton } };
  } catch (err) {
    if (err instanceof TropDeDemandes) return { ...TROP_DE_CODES, data };
    console.error(err);
    return { ...ERREUR_SERVEUR, data };
  }
}

/** Step 2: the received code confirms the cancellation. */
export async function annulerRendezVous(_prev: FormState, formData: FormData): Promise<FormState> {
  const verif = await verifierSaisie("annulation", formData);
  if (!verif.ok) return verif.state;

  try {
    const res = await execute(
      `UPDATE rendez_vous SET statut = 'annule'
       WHERE reference = ? AND email = ? AND statut IN ('en_attente','confirme') AND date_rdv >= CURDATE()`,
      [verif.donnees.reference, verif.email],
    );
    if (res.affectedRows === 0) return { ok: false, message: "This appointment can no longer be cancelled." };
    revalidatePath("/", "layout");
    return { ok: true, message: "Your appointment has been cancelled." };
  } catch (err) {
    console.error(err);
    return ERREUR_SERVEUR;
  }
}
