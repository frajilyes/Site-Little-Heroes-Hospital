"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { execute, queryOne } from "@/lib/db";
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
import { DATE, EMAIL, TEL, validate } from "@/lib/validation";
import type { FormState } from "@/lib/types";

const refreshAll = () => revalidatePath("/", "layout");

/* ------------------------------ Connexion ------------------------------ */

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const { data, ok } = validate(formData, {
    email: { label: "L'e-mail", required: true, pattern: EMAIL },
    password: { label: "Le mot de passe", required: true },
  });
  const from = String(formData.get("from") ?? "");
  const errorState: FormState = { ok: false, message: "Identifiants incorrects.", data: { email: data.email } };
  if (!ok) return errorState;

  const admin = await queryOne<{ id: number; email: string; nom: string; password_hash: string }>(
    "SELECT id, email, nom, password_hash FROM admins WHERE email = ?",
    [data.email.toLowerCase()],
  );
  if (!admin || !(await verifyPassword(data.password, admin.password_hash))) return errorState;

  // Redirection uniquement vers une page interne de l'admin
  const destination = from.startsWith("/admin") && !from.startsWith("//") ? from : "/admin";
  const user = { id: admin.id, email: admin.email, nom: admin.nom };

  // Appareil déjà validé par un code : pas de nouvelle vérification
  if (await isTrustedDevice(admin.id)) {
    await createSession(user);
    redirect(destination);
  }

  try {
    await sendVerificationCode({ ...user, from: destination });
  } catch (err) {
    console.error(err);
    return { ok: false, message: "Impossible d'envoyer le code de vérification. Réessayez.", data: { email: data.email } };
  }
  redirect("/admin/login/verification");
}

export async function verifierCode(_prev: FormState, formData: FormData): Promise<FormState> {
  const pending = await getPendingLogin();
  if (!pending) redirect("/admin/login");

  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  if (code.length !== 6) return { ok: false, message: "Le code contient 6 chiffres.", errors: { code: "Code incomplet." } };

  const result = await checkVerificationCode(pending.id, code);
  if (result === "expire")
    return { ok: false, message: "Ce code a expiré ou trop d'essais ont échoué. Demandez un nouveau code.", errors: { code: " " } };
  if (result === "invalide") return { ok: false, message: "Code incorrect. Vérifiez l'e-mail reçu.", errors: { code: "Code incorrect." } };

  await clearPendingLogin();
  if (formData.get("confiance") === "on") await trustDevice(pending.id);
  await createSession({ id: pending.id, email: pending.email, nom: pending.nom });
  redirect(pending.from);
}

export async function renvoyerCode(): Promise<FormState> {
  const pending = await getPendingLogin();
  if (!pending) redirect("/admin/login");

  const attente = await resendCooldown(pending.id);
  if (attente > 0) return { ok: false, message: `Patientez ${attente} s avant de demander un nouveau code.` };
  try {
    await sendVerificationCode({ id: pending.id, email: pending.email, nom: pending.nom, from: pending.from });
  } catch (err) {
    console.error(err);
    return { ok: false, message: "Impossible d'envoyer le code. Réessayez dans un instant." };
  }
  return { ok: true, message: "Un nouveau code vous a été envoyé." };
}

export async function annulerConnexion() {
  await clearPendingLogin();
  redirect("/admin/login");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ------------------------------ Rendez-vous ------------------------------ */

const STATUTS_RDV = ["en_attente", "confirme", "annule", "termine"];

export async function changerStatutRdv(id: number, statut: string): Promise<FormState> {
  await requireAdmin();
  if (!STATUTS_RDV.includes(statut)) return { ok: false, message: "Statut invalide." };
  try {
    await execute("UPDATE rendez_vous SET statut = ? WHERE id = ?", [statut, id]);
  } catch (err) {
    // Réactiver un RDV annulé dont le créneau a été repris viole l'index unique
    if ((err as { code?: string }).code === "ER_DUP_ENTRY")
      return { ok: false, message: "Ce créneau est déjà occupé par un autre rendez-vous." };
    throw err;
  }
  refreshAll();
  return { ok: true, message: "Statut mis à jour." };
}

/* ------------------------------ Patients ------------------------------ */

export async function admettrePatient(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { data, errors, ok } = validate(formData, {
    prenom: { label: "Le prénom", required: true, min: 2, max: 60 },
    nom: { label: "Le nom", required: true, min: 2, max: 60 },
    date_naissance: { label: "La date de naissance", required: true, pattern: DATE },
    sexe: { label: "Le sexe", required: true, pattern: /^[FM]$/ },
    groupe_sanguin: { label: "Le groupe sanguin", pattern: /^(A|B|AB|O)[+-]$/ },
    allergies: { label: "Les allergies", max: 255 },
    service_id: { label: "Le service", required: true, int: [1, 10_000] },
    medecin_id: { label: "Le médecin", int: [1, 10_000] },
    chambre: { label: "La chambre", required: true, max: 20 },
    date_sortie_prevue: { label: "La sortie prévue", pattern: DATE },
    statut: { label: "Le statut", required: true, pattern: /^(hospitalise|observation)$/ },
    parent_nom: { label: "Le nom du parent", required: true, min: 2, max: 120 },
    parent_tel: { label: "Le téléphone", required: true, pattern: TEL, patternMsg: "Numéro invalide." },
  });
  if (!ok) return { ok: false, message: "Merci de corriger les champs indiqués.", errors, data };

  await execute(
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
  );
  refreshAll();
  return { ok: true, message: `${data.prenom} ${data.nom} a été admis(e).` };
}

export async function changerStatutPatient(id: number, statut: string): Promise<FormState> {
  await requireAdmin();
  if (!["hospitalise", "observation", "sorti"].includes(statut)) return { ok: false, message: "Statut invalide." };
  await execute(
    `UPDATE patients SET statut = ?, date_sortie_prevue = IF(? = 'sorti', CURDATE(), date_sortie_prevue) WHERE id = ?`,
    [statut, statut, id],
  );
  refreshAll();
  return { ok: true, message: statut === "sorti" ? "Sortie enregistrée. Bon retour à la maison !" : "Statut mis à jour." };
}

/* ------------------------------ Médecins ------------------------------ */

export async function basculerDisponibilite(id: number): Promise<FormState> {
  await requireAdmin();
  await execute("UPDATE medecins SET disponible = 1 - disponible WHERE id = ?", [id]);
  refreshAll();
  return { ok: true, message: "Disponibilité mise à jour." };
}

/* ------------------------------ Messages ------------------------------ */

export async function marquerMessage(id: number, lu: boolean): Promise<FormState> {
  await requireAdmin();
  await execute("UPDATE messages SET lu = ? WHERE id = ?", [lu ? 1 : 0, id]);
  refreshAll();
  return { ok: true, message: lu ? "Marqué comme lu." : "Marqué comme non lu." };
}

export async function supprimerMessage(id: number): Promise<FormState> {
  await requireAdmin();
  await execute("DELETE FROM messages WHERE id = ?", [id]);
  refreshAll();
  return { ok: true, message: "Message supprimé." };
}

/* ------------------------------ Activités ------------------------------ */

export async function creerActivite(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { data, errors, ok } = validate(formData, {
    titre: { label: "Le titre", required: true, min: 3, max: 120 },
    description: { label: "La description", required: true, min: 10, max: 2000 },
    categorie: { label: "La catégorie", required: true },
    emoji: { label: "L'emoji", required: true, max: 10 },
    age_min: { label: "L'âge minimum", required: true, int: [0, 18] },
    age_max: { label: "L'âge maximum", required: true, int: [0, 18] },
    lieu: { label: "Le lieu", required: true, max: 120 },
    jour: { label: "Le jour", required: true, int: [1, 7] },
    heure_debut: { label: "L'heure de début", required: true, pattern: /^\d{2}:\d{2}$/ },
    heure_fin: { label: "L'heure de fin", required: true, pattern: /^\d{2}:\d{2}$/ },
    places: { label: "Le nombre de places", required: true, int: [1, 500] },
    animateur: { label: "L'animateur", required: true, max: 120 },
  });
  if (data.categorie && !(data.categorie in CATEGORIES)) errors.categorie = "Catégorie inconnue.";
  if (Number(data.age_min) > Number(data.age_max)) errors.age_max = "Doit être ≥ à l'âge minimum.";
  if (data.heure_debut && data.heure_fin && data.heure_debut >= data.heure_fin) errors.heure_fin = "Doit être après le début.";
  if (!ok || Object.keys(errors).length) return { ok: false, message: "Merci de corriger les champs indiqués.", errors, data };

  await execute(
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
  );
  refreshAll();
  return { ok: true, message: `Activité « ${data.titre} » créée.` };
}

export async function basculerActivite(id: number): Promise<FormState> {
  await requireAdmin();
  await execute("UPDATE activites SET actif = 1 - actif WHERE id = ?", [id]);
  refreshAll();
  return { ok: true, message: "Activité mise à jour." };
}

export async function supprimerInscription(id: number): Promise<FormState> {
  await requireAdmin();
  await execute("DELETE FROM inscriptions_activites WHERE id = ?", [id]);
  refreshAll();
  return { ok: true, message: "Inscription annulée." };
}

/* ------------------------------ Actualités ------------------------------ */

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
    titre: { label: "Le titre", required: true, min: 5, max: 200 },
    resume: { label: "Le résumé", required: true, min: 10, max: 400 },
    contenu: { label: "Le contenu", required: true, min: 20, max: 20_000 },
    categorie: { label: "La catégorie", required: true, max: 40 },
    emoji: { label: "L'emoji", required: true, max: 10 },
    couleur: { label: "La couleur", required: true, pattern: /^(rose|sky|red|amber|violet|indigo|emerald|teal)$/ },
  });
  if (!ok) return { ok: false, message: "Merci de corriger les champs indiqués.", errors, data };

  const slug = `${slugify(data.titre)}-${Date.now().toString(36)}`;
  await execute(
    `INSERT INTO actualites (slug, titre, resume, contenu, categorie, emoji, couleur, date_pub) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
    [slug, data.titre, data.resume, data.contenu, data.categorie, data.emoji, data.couleur],
  );
  refreshAll();
  return { ok: true, message: "Actualité publiée !" };
}

export async function supprimerActualite(id: number): Promise<FormState> {
  await requireAdmin();
  await execute("DELETE FROM actualites WHERE id = ?", [id]);
  refreshAll();
  return { ok: true, message: "Actualité supprimée." };
}
