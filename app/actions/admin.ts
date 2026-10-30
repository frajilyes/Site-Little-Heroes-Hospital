"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { execute, isDuplicateError, queryOne } from "@/lib/db";
import {
  checkVerificationCode,
  clearPendingLogin,
  createSession,
  creerPremierAdmin,
  destroySession,
  getPendingLogin,
  getSession,
  HASH_LEURRE,
  hashPassword,
  inscriptionOuverte,
  isTrustedDevice,
  requireAdmin,
  resendCooldown,
  sendVerificationCode,
  trustDevice,
  verifyPassword,
} from "@/lib/auth";
import { adresseClient, delai, limiter } from "@/lib/rate-limit";
import { CATEGORIES } from "@/lib/theme";
import { EMAIL, HEURE, motDePasseFaible, TEL, validate } from "@/lib/validation";
import type { FormState } from "@/lib/types";

const refreshAll = () => revalidatePath("/", "layout");

/**
 * Runs a database write and reports failure as a form message instead of letting the
 * driver error escape to the error page (a stale id, for instance, breaks a foreign key).
 *
 * Only the write itself is wrapped, never `requireAdmin()`: `redirect()` signals itself by
 * throwing, and that must keep propagating.
 */
async function ecrire(
  journal: { action: string; cible?: string | number },
  write: () => Promise<unknown>,
  succes: string,
  doublon?: string,
): Promise<FormState> {
  try {
    await write();
  } catch (err) {
    if (doublon && isDuplicateError(err)) {
      await journaliser(journal.action, "echec", { cible: journal.cible });
      return { ok: false, message: doublon };
    }
    console.error(err);
    await journaliser(journal.action, "echec", { cible: journal.cible });
    return { ok: false, message: "Oops, something went wrong. Please try again in a moment." };
  }
  await journaliser(journal.action, "ok", { cible: journal.cible });
  refreshAll();
  return { ok: true, message: succes };
}

/**
 * Append-only trail of who did what in the staff area.
 *
 * For medical records "the row changed" is not the question anyone asks afterwards — by
 * whom, from where and when is. Every write goes through `ecrire`, so recording it here
 * covers all of them at one point instead of thirteen.
 *
 * This must never break the operation it describes: the write has already happened by the
 * time we get here, and a database that has not had the migration applied yet would
 * otherwise turn every successful save into an error. Failures go to the server log so
 * the gap is visible rather than silent.
 */
async function journaliser(
  action: string,
  resultat: "ok" | "echec",
  extra: { cible?: string | number; email?: string } = {},
) {
  try {
    // On a failed login there is no session yet, so the attempted address is passed in.
    const session = extra.email ? null : await getSession();
    await execute(
      "INSERT INTO admin_audit (admin_id, admin_email, action, cible, adresse, resultat) VALUES (?, ?, ?, ?, ?, ?)",
      [
        session?.id ?? null,
        extra.email ?? session?.email ?? "inconnu",
        action,
        extra.cible != null ? String(extra.cible) : null,
        await adresseClient(),
        resultat,
      ],
    );
  } catch (err) {
    console.error(`[audit] could not record ${action}:`, err);
  }
}

const DEMANDE_INVALIDE: FormState = { ok: false, message: "Invalid request." };

/**
 * A Server Action deserializes whatever the caller sends, so an `id: number` parameter is a
 * compile-time promise only — at runtime it can be a string, an object or null. Ids are
 * checked here before reaching the driver, where a non-numeric value would either be
 * coerced into matching an unintended row or surface as a raw driver error.
 */
function identifiant(valeur: unknown): number | null {
  return typeof valeur === "number" && Number.isInteger(valeur) && valeur > 0 ? valeur : null;
}

/* ------------------------------ Login ------------------------------ */

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const { data, ok } = validate(formData, {
    email: { label: "Email", required: true, pattern: EMAIL, max: 160 },
    // Bounded: scrypt is deliberately expensive, and the length of what it hashes is the
    // one part of that cost an unauthenticated caller gets to choose.
    password: { label: "Password", required: true, max: 200 },
  });
  const from = String(formData.get("from") ?? "");
  const errorState: FormState = { ok: false, message: "Incorrect credentials.", data: { email: data.email } };
  if (!ok) return errorState;

  const email = data.email.toLowerCase();

  // Checked before the password is verified, not after: scrypt is deliberately slow, so an
  // unthrottled login is both a brute-force path and a way to pin the CPU with junk guesses.
  // The address limit is the wide net; the per-account one holds even if the address rotates.
  const adresse = await adresseClient();
  for (const [cle, max, fenetre] of [
    [`login:ip:${adresse}`, 10, 600],
    [`login:compte:${email}`, 5, 900],
  ] as const) {
    const limite = limiter(cle, max, fenetre);
    if (!limite.ok) {
      return {
        ok: false,
        message: `Too many login attempts. Please try again in ${delai(limite.retryAfter)}.`,
        data: { email: data.email },
      };
    }
  }

  const admin = await queryOne<{ id: number; email: string; nom: string; password_hash: string }>(
    "SELECT id, email, nom, password_hash FROM admins WHERE email = ?",
    [email],
  );
  // The hash is always computed, even when no account matches. Returning early on a
  // missing address would answer in a fraction of the time a real one takes, which turns
  // the login form into a way to discover which staff addresses exist.
  const motDePasseOk = await verifyPassword(data.password, admin?.password_hash ?? HASH_LEURRE);
  if (!admin || !motDePasseOk) {
    await journaliser("login.echec", "echec", { email });
    return errorState;
  }

  // Only ever redirect to an internal admin page. Matching the segment boundary rather
  // than the prefix rejects "//evil.com" (protocol-relative), "/admin\@evil.com" (browsers
  // may read the backslash as a separator) and "/adminsomething", which is not a route.
  const destination = /^\/admin(?:[/?#]|$)/.test(from) ? from : "/admin";
  const user = { id: admin.id, email: admin.email, nom: admin.nom };

  // Device already validated by a code: no new verification needed
  if (await isTrustedDevice(admin.id, admin.password_hash)) {
    await journaliser("login.ok.appareil-connu", "ok", { email: admin.email });
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
  if (result !== "ok") await journaliser(`login.code.${result}`, "echec", { email: pending.email });
  if (result === "expire")
    return { ok: false, message: "This code has expired or too many attempts failed. Request a new code.", errors: { code: " " } };
  if (result === "invalide") return { ok: false, message: "Incorrect code. Check the email you received.", errors: { code: "Incorrect code." } };

  await clearPendingLogin();
  const confiance = formData.get("confiance") === "on";
  if (confiance) {
    // The current hash is read here so the cookie can be tied to it: see trustDevice.
    const admin = await queryOne<{ password_hash: string }>("SELECT password_hash FROM admins WHERE id = ?", [
      pending.id,
    ]);
    if (admin) await trustDevice(pending.id, admin.password_hash);
  }
  await journaliser(`login.ok.code${confiance ? ".appareil-memorise" : ""}`, "ok", { email: pending.email });
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
  // Recorded before the cookie goes: journaliser reads the session to know who acted.
  await journaliser("logout", "ok");
  await destroySession();
  redirect("/admin/login");
}

/* ------------------------------ Registration (first account) ------------------------------ */

/**
 * Creates the first staff account from the public form.
 *
 * Open only while the `admins` table is empty: `npm run db:setup` normally seeds that
 * account, and this is the path for an install where it never ran. There is no open
 * sign-up for the staff area — once the account exists the form is closed for good, and
 * further accounts are added in the database.
 *
 * The new account gets no session here: it goes through the same e-mail code as any other
 * login, so the address has to be a real one the registrant can read before the first
 * session is issued.
 */
export async function inscription(_prev: FormState, formData: FormData): Promise<FormState> {
  const { data, errors } = validate(formData, {
    nom: { label: "Name", required: true, min: 2, max: 120 },
    email: { label: "Email", required: true, pattern: EMAIL, max: 160 },
    // Bounded like the login form: scrypt is deliberately expensive, and the length of
    // what it hashes is the one part of that cost the caller gets to choose.
    password: { label: "Password", required: true, max: 200 },
    confirmation: { label: "Confirmation", required: true, max: 200 },
  });
  // Never echoed back: the password fields are re-typed, not refilled.
  const saisie = { nom: data.nom, email: data.email };

  // Unauthenticated, and an accepted submission runs scrypt and opens a transaction.
  const adresse = await adresseClient();
  const limite = limiter(`inscription:ip:${adresse}`, 5, 900);
  if (!limite.ok)
    return {
      ok: false,
      message: `Too many attempts. Please try again in ${delai(limite.retryAfter)}.`,
      data: saisie,
    };

  const faible = data.password ? motDePasseFaible(data.password) : null;
  if (faible) errors.password = faible;
  else if (data.password && data.password !== data.confirmation) errors.confirmation = "The two passwords differ.";
  if (Object.keys(errors).length > 0)
    return { ok: false, message: "Please check the highlighted fields.", errors, data: saisie };

  const email = data.email.toLowerCase();
  const ferme: FormState = {
    ok: false,
    message: "Registration is closed: a staff account already exists.",
    data: saisie,
  };
  // Checked before the hash is computed, so a closed form costs nothing; checked again
  // inside creerPremierAdmin, which is the one that actually holds the lock.
  if (!(await inscriptionOuverte())) {
    await journaliser("inscription.fermee", "echec", { email });
    return ferme;
  }

  const id = await creerPremierAdmin(email, data.nom, await hashPassword(data.password));
  if (id === null) {
    await journaliser("inscription.fermee", "echec", { email });
    return ferme;
  }
  await journaliser("inscription.ok", "ok", { email });

  try {
    await sendVerificationCode({ id, email, nom: data.nom, from: "/admin" });
  } catch (err) {
    console.error(err);
    // The account exists: the only thing missing is the code, which a login re-sends.
    return {
      ok: false,
      message: "Account created, but the verification email could not be sent. Log in to request a new code.",
      data: saisie,
    };
  }
  redirect("/admin/login/verification");
}

/* ------------------------------ Appointments ------------------------------ */

const STATUTS_RDV = ["en_attente", "confirme", "annule", "termine"];

export async function changerStatutRdv(id: number, statut: string): Promise<FormState> {
  await requireAdmin();
  const rdv = identifiant(id);
  if (!rdv) return DEMANDE_INVALIDE;
  if (!STATUTS_RDV.includes(statut)) return { ok: false, message: "Invalid status." };
  return ecrire(
    { action: "rdv.statut", cible: rdv },
    () => execute("UPDATE rendez_vous SET statut = ? WHERE id = ?", [statut, rdv]),
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
    { action: "patient.admission", cible: `${data.prenom} ${data.nom}` },
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
  const patient = identifiant(id);
  if (!patient) return DEMANDE_INVALIDE;
  if (!["hospitalise", "observation", "sorti"].includes(statut)) return { ok: false, message: "Invalid status." };
  return ecrire(
    { action: `patient.statut.${statut}`, cible: patient },
    () =>
      execute(
        `UPDATE patients SET statut = ?, date_sortie_prevue = IF(? = 'sorti', CURDATE(), date_sortie_prevue) WHERE id = ?`,
        [statut, statut, patient],
      ),
    statut === "sorti" ? "Discharge recorded. Welcome home!" : "Status updated.",
  );
}

/* ------------------------------ Doctors ------------------------------ */

export async function basculerDisponibilite(id: number): Promise<FormState> {
  await requireAdmin();
  const medecin = identifiant(id);
  if (!medecin) return DEMANDE_INVALIDE;
  return ecrire(
    { action: "medecin.disponibilite", cible: medecin },
    () => execute("UPDATE medecins SET disponible = 1 - disponible WHERE id = ?", [medecin]),
    "Availability updated.",
  );
}

/* ------------------------------ Messages ------------------------------ */

export async function marquerMessage(id: number, lu: boolean): Promise<FormState> {
  await requireAdmin();
  const message = identifiant(id);
  if (!message) return DEMANDE_INVALIDE;
  return ecrire(
    { action: "message.lu", cible: message },
    () => execute("UPDATE messages SET lu = ? WHERE id = ?", [lu ? 1 : 0, message]),
    lu ? "Marked as read." : "Marked as unread.",
  );
}

export async function supprimerMessage(id: number): Promise<FormState> {
  await requireAdmin();
  const message = identifiant(id);
  if (!message) return DEMANDE_INVALIDE;
  return ecrire(
    { action: "message.suppression", cible: message },
    () => execute("DELETE FROM messages WHERE id = ?", [message]),
    "Message deleted.",
  );
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
    heure_debut: { label: "Start time", required: true, pattern: HEURE },
    heure_fin: { label: "End time", required: true, pattern: HEURE },
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
    { action: "activite.creation", cible: data.titre },
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
  const activite = identifiant(id);
  if (!activite) return DEMANDE_INVALIDE;
  return ecrire(
    { action: "activite.activation", cible: activite },
    () => execute("UPDATE activites SET actif = 1 - actif WHERE id = ?", [activite]),
    "Activity updated.",
  );
}

export async function supprimerInscription(id: number): Promise<FormState> {
  await requireAdmin();
  const inscription = identifiant(id);
  if (!inscription) return DEMANDE_INVALIDE;
  return ecrire(
    { action: "inscription.suppression", cible: inscription },
    () => execute("DELETE FROM inscriptions_activites WHERE id = ?", [inscription]),
    "Registration cancelled.",
  );
}

/* ------------------------------ News ------------------------------ */

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
    // Stored as written and handed to next/image by lib/images.ts: an Unsplash id, a path
    // on this site, or an Unsplash URL. Nothing else, so a published article cannot point
    // the page at a third-party host.
    image: {
      label: "Illustration",
      max: 255,
      pattern: /^(?:[\w-]+|\/[\w./-]+|https:\/\/images\.unsplash\.com\/[\w./?=&%+-]+)$/,
      patternMsg: "Unsplash id, path on the site, or images.unsplash.com URL.",
    },
    couleur: { label: "Color", required: true, pattern: /^(rose|sky|red|amber|violet|indigo|emerald|teal)$/ },
  });
  if (!ok) return { ok: false, message: "Please correct the fields indicated.", errors, data };

  const slug = `${slugify(data.titre)}-${Date.now().toString(36)}`;
  return ecrire(
    { action: "actualite.publication", cible: slug },
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
  const actualite = identifiant(id);
  if (!actualite) return DEMANDE_INVALIDE;
  return ecrire(
    { action: "actualite.suppression", cible: actualite },
    () => execute("DELETE FROM actualites WHERE id = ?", [actualite]),
    "News article deleted.",
  );
}
