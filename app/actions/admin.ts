"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { execute, isDuplicateError, queryOne } from "@/lib/db";
import {
  checkVerificationCode,
  clearPendingLogin,
  createSession,
  destroySession,
  getPendingLogin,
  isTrustedDevice,
  requireAdmin,
  resendCooldown,
  sendVerificationCode,
  trustDevice,
  verifyPassword,
} from "@/lib/auth";
import { CATEGORIES } from "@/lib/theme";
import { EMAIL, TEL, validate } from "@/lib/validation";
import type { FormState } from "@/lib/types";

const refreshAll = () => revalidatePath("/", "layout");

/**
 * Runs a database write and reports failure as a form message instead of letting the
 * driver error escape to the error page (a stale id, for instance, breaks a foreign key).
 *
 * Only the write itself is wrapped, never `requireAdmin()`: `redirect()` signals itself by
 * throwing, and that must keep propagating.
 */
async function ecrire(write: () => Promise<unknown>, succes: string, doublon?: string): Promise<FormState> {
  try {
    await write();
  } catch (err) {
    if (doublon && isDuplicateError(err)) return { ok: false, message: doublon };
    console.error(err);
    return { ok: false, message: "Oops, something went wrong. Please try again in a moment." };
  }
  refreshAll();
  return { ok: true, message: succes };
}

/* ------------------------------ Login ------------------------------ */

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const { data, ok } = validate(formData, {
    email: { label: "Email", required: true, pattern: EMAIL },
    password: { label: "Password", required: true },
  });
  const from = String(formData.get("from") ?? "");
  const errorState: FormState = { ok: false, message: "Incorrect credentials.", data: { email: data.email } };
  if (!ok) return errorState;

  const admin = await queryOne<{ id: number; email: string; nom: string; password_hash: string }>(
    "SELECT id, email, nom, password_hash FROM admins WHERE email = ?",
    [data.email.toLowerCase()],
  );
  if (!admin || !(await verifyPassword(data.password, admin.password_hash))) return errorState;

  // Only redirect to an internal admin page
  const destination = from.startsWith("/admin") && !from.startsWith("//") ? from : "/admin";
  const user = { id: admin.id, email: admin.email, nom: admin.nom };

  // Device already validated by a code: no new verification needed
  if (await isTrustedDevice(admin.id)) {
    await createSession(user);
    redirect(destination);
  }

  try {
    await sendVerificationCode({ ...user, from: destination });
  } catch (err) {
    console.error(err);
    return { ok: false, message: "Could not send the verification code. Please try again.", data: { email: data.email } };
  }
  redirect("/admin/login/verification");
}

export async function verifierCode(_prev: FormState, formData: FormData): Promise<FormState> {
  const pending = await getPendingLogin();
  if (!pending) redirect("/admin/login");

  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  if (code.length !== 6) return { ok: false, message: "The code has 6 digits.", errors: { code: "Incomplete code." } };

  const result = await checkVerificationCode(pending.id, code);
  if (result === "expire")
    return { ok: false, message: "This code has expired or too many attempts failed. Request a new code.", errors: { code: " " } };
  if (result === "invalide") return { ok: false, message: "Incorrect code. Check the email you received.", errors: { code: "Incorrect code." } };

  await clearPendingLogin();
  if (formData.get("confiance") === "on") await trustDevice(pending.id);
  await createSession({ id: pending.id, email: pending.email, nom: pending.nom });
  redirect(pending.from);
}

export async function renvoyerCode(): Promise<FormState> {
  const pending = await getPendingLogin();
  if (!pending) redirect("/admin/login");

  const attente = await resendCooldown(pending.id);
  if (attente > 0) return { ok: false, message: `Please wait ${attente}s before requesting a new code.` };
  try {
    await sendVerificationCode({ id: pending.id, email: pending.email, nom: pending.nom, from: pending.from });
  } catch (err) {
    console.error(err);
    return { ok: false, message: "Could not send the code. Please try again in a moment." };
  }
  return { ok: true, message: "A new code has been sent to you." };
}

export async function annulerConnexion() {
  await clearPendingLogin();
  redirect("/admin/login");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ------------------------------ Appointments ------------------------------ */

const STATUTS_RDV = ["en_attente", "confirme", "annule", "termine"];

export async function changerStatutRdv(id: number, statut: string): Promise<FormState> {
  await requireAdmin();
  if (!STATUTS_RDV.includes(statut)) return { ok: false, message: "Invalid status." };
  return ecrire(
    () => execute("UPDATE rendez_vous SET statut = ? WHERE id = ?", [statut, id]),
    "Status updated.",
    // Reactivating a cancelled appointment whose slot was taken violates the unique index
    "This time slot is already taken by another appointment.",
  );
}

/* ------------------------------ Patients ------------------------------ */

export async function admettrePatient(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { data, errors, ok } = validate(formData, {
    prenom: { label: "First name", required: true, min: 2, max: 60 },
    nom: { label: "Last name", required: true, min: 2, max: 60 },
    date_naissance: { label: "Date of birth", required: true, date: true },
    sexe: { label: "Sex", required: true, pattern: /^[FM]$/ },
    groupe_sanguin: { label: "Blood type", pattern: /^(A|B|AB|O)[+-]$/ },
    allergies: { label: "Allergies", max: 255 },
    service_id: { label: "Department", required: true, int: [1, 10_000] },
    medecin_id: { label: "Doctor", int: [1, 10_000] },
    chambre: { label: "Room", required: true, max: 20 },
    date_sortie_prevue: { label: "Expected discharge date", date: true },
    statut: { label: "Status", required: true, pattern: /^(hospitalise|observation)$/ },
    parent_nom: { label: "Parent's name", required: true, min: 2, max: 120 },
    parent_tel: { label: "Phone number", required: true, pattern: TEL, patternMsg: "Invalid number." },
  });
  if (!ok) return { ok: false, message: "Please correct the fields indicated.", errors, data };

  return ecrire(
    () =>
      execute(
        `INSERT INTO patients (prenom, nom, date_naissance, sexe, groupe_sanguin, allergies, service_id, medecin_id, chambre,
           date_admission, date_sortie_prevue, statut, parent_nom, parent_tel)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
        [
          data.prenom,
          data.nom,
          data.date_naissance,
          data.sexe,
          data.groupe_sanguin || null,
          data.allergies || null,
          Number(data.service_id),
          data.medecin_id ? Number(data.medecin_id) : null,
          data.chambre,
          data.date_sortie_prevue || null,
          data.statut,
          data.parent_nom,
          data.parent_tel,
        ],
      ),
    `${data.prenom} ${data.nom} has been admitted.`,
  );
}

export async function changerStatutPatient(id: number, statut: string): Promise<FormState> {
  await requireAdmin();
  if (!["hospitalise", "observation", "sorti"].includes(statut)) return { ok: false, message: "Invalid status." };
  return ecrire(
    () =>
      execute(
        `UPDATE patients SET statut = ?, date_sortie_prevue = IF(? = 'sorti', CURDATE(), date_sortie_prevue) WHERE id = ?`,
        [statut, statut, id],
      ),
    statut === "sorti" ? "Discharge recorded. Welcome home!" : "Status updated.",
  );
}

/* ------------------------------ Doctors ------------------------------ */

export async function basculerDisponibilite(id: number): Promise<FormState> {
  await requireAdmin();
  return ecrire(
    () => execute("UPDATE medecins SET disponible = 1 - disponible WHERE id = ?", [id]),
    "Availability updated.",
  );
}

/* ------------------------------ Messages ------------------------------ */

export async function marquerMessage(id: number, lu: boolean): Promise<FormState> {
  await requireAdmin();
  return ecrire(
    () => execute("UPDATE messages SET lu = ? WHERE id = ?", [lu ? 1 : 0, id]),
    lu ? "Marked as read." : "Marked as unread.",
  );
}

export async function supprimerMessage(id: number): Promise<FormState> {
  await requireAdmin();
  return ecrire(() => execute("DELETE FROM messages WHERE id = ?", [id]), "Message deleted.");
}

/* ------------------------------ Activities ------------------------------ */

export async function creerActivite(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { data, errors, ok } = validate(formData, {
    titre: { label: "Title", required: true, min: 3, max: 120 },
    description: { label: "Description", required: true, min: 10, max: 2000 },
    categorie: { label: "Category", required: true },
    emoji: { label: "Emoji", required: true, max: 10 },
    age_min: { label: "Minimum age", required: true, int: [0, 18] },
    age_max: { label: "Maximum age", required: true, int: [0, 18] },
    lieu: { label: "Location", required: true, max: 120 },
    jour: { label: "Day", required: true, int: [1, 7] },
    heure_debut: { label: "Start time", required: true, pattern: /^\d{2}:\d{2}$/ },
    heure_fin: { label: "End time", required: true, pattern: /^\d{2}:\d{2}$/ },
    places: { label: "Number of spots", required: true, int: [1, 500] },
    animateur: { label: "Facilitator", required: true, max: 120 },
  });
  // hasOwn, not `in`: `in` also matches inherited keys, so categorie=toString would pass
  // validation and MySQL would then store "" in the ENUM column.
  if (data.categorie && !Object.hasOwn(CATEGORIES, data.categorie)) errors.categorie = "Unknown category.";
  if (Number(data.age_min) > Number(data.age_max)) errors.age_max = "Must be ≥ the minimum age.";
  if (data.heure_debut && data.heure_fin && data.heure_debut >= data.heure_fin) errors.heure_fin = "Must be after the start time.";
  if (!ok || Object.keys(errors).length) return { ok: false, message: "Please correct the fields indicated.", errors, data };

  return ecrire(
    () =>
      execute(
        `INSERT INTO activites (titre, description, categorie, age_min, age_max, lieu, jour, heure_debut, heure_fin, places, animateur, emoji)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.titre,
          data.description,
          data.categorie,
          Number(data.age_min),
          Number(data.age_max),
          data.lieu,
          Number(data.jour),
          data.heure_debut,
          data.heure_fin,
          Number(data.places),
          data.animateur,
          data.emoji,
        ],
      ),
    `Activity "${data.titre}" created.`,
  );
}

export async function basculerActivite(id: number): Promise<FormState> {
  await requireAdmin();
  return ecrire(() => execute("UPDATE activites SET actif = 1 - actif WHERE id = ?", [id]), "Activity updated.");
}

export async function supprimerInscription(id: number): Promise<FormState> {
  await requireAdmin();
  return ecrire(
    () => execute("DELETE FROM inscriptions_activites WHERE id = ?", [id]),
    "Registration cancelled.",
  );
}

/* ------------------------------ News ------------------------------ */

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export async function publierActualite(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { data, errors, ok } = validate(formData, {
    titre: { label: "Title", required: true, min: 5, max: 200 },
    resume: { label: "Summary", required: true, min: 10, max: 400 },
    contenu: { label: "Content", required: true, min: 20, max: 20_000 },
    categorie: { label: "Category", required: true, max: 40 },
    image: { label: "Illustration", max: 255 },
    couleur: { label: "Color", required: true, pattern: /^(rose|sky|red|amber|violet|indigo|emerald|teal)$/ },
  });
  if (!ok) return { ok: false, message: "Please correct the fields indicated.", errors, data };

  const slug = `${slugify(data.titre)}-${Date.now().toString(36)}`;
  return ecrire(
    () =>
      execute(
        `INSERT INTO actualites (slug, titre, resume, contenu, categorie, image, couleur, date_pub) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [slug, data.titre, data.resume, data.contenu, data.categorie, data.image || null, data.couleur],
      ),
    "News article published!",
  );
}

export async function supprimerActualite(id: number): Promise<FormState> {
  await requireAdmin();
  return ecrire(() => execute("DELETE FROM actualites WHERE id = ?", [id]), "News article deleted.");
}
