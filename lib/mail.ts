import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

// Transport SMTP partagé (Gmail, OVH, Mailtrap…), configuré via .env.local.
const globalForMail = globalThis as unknown as { __mailer?: Transporter };

function getTransport(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST) return null;
  if (!globalForMail.__mailer) {
    const port = Number(SMTP_PORT ?? 465);
    globalForMail.__mailer = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
    });
  }
  return globalForMail.__mailer;
}

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/** Envoie un e-mail. Sans SMTP configuré, l'affiche dans la console en développement. */
export async function sendMail(mail: Mail): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    if (process.env.NODE_ENV === "production") throw new Error("SMTP_HOST manquant : impossible d'envoyer des e-mails.");
    console.info(`\n📧 [e-mail non envoyé — SMTP non configuré]\n   À : ${mail.to}\n   Objet : ${mail.subject}\n${mail.text}\n`);
    return;
  }
  await transport.sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    ...mail,
  });
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const STYLE = "font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#2b2d42";
const GRIS = "color:#6c757d;font-size:14px";

/** Code à 6 chiffres envoyé pour confirmer une action (connexion, rendez-vous, annulation). */
export function mailCode({ to, code, minutes, pour, nom, alerte }: {
  to: string;
  code: string;
  minutes: number;
  pour: string;
  nom?: string;
  alerte?: string;
}): Mail {
  const bonjour = nom ? `Bonjour ${nom},` : "Bonjour,";
  const avertissement = alerte ?? "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.";
  return {
    to,
    subject: `${code} est votre code de confirmation`,
    text: [bonjour, "", `Voici le code pour ${pour} : ${code}`, `Il expire dans ${minutes} minutes.`, "", avertissement].join("\n"),
    html: `<div style="${STYLE}">
  <h2 style="margin:0 0 16px">Hôpital des Petits Héros</h2>
  <p>${escape(bonjour)}</p>
  <p>Voici le code pour ${escape(pour)} :</p>
  <p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;background:#fff4e6;border-radius:12px;padding:16px">${code}</p>
  <p style="${GRIS}">Ce code expire dans ${minutes} minutes. Ne le communiquez à personne.</p>
  <p style="${GRIS}">${escape(avertissement)}</p>
</div>`,
  };
}

export function mailCodeVerification(to: string, nom: string, code: string, minutes: number): Mail {
  return mailCode({
    to,
    code,
    minutes,
    nom,
    pour: "vous connecter à l'espace personnel",
    alerte: "Si vous n'êtes pas à l'origine de cette demande, quelqu'un connaît votre mot de passe : changez-le sans attendre.",
  });
}

/** Récapitulatif envoyé une fois le rendez-vous confirmé par le code. */
export function mailRecapRdv(to: string, rdv: { reference: string; parent: string; enfant: string; quand: string; medecin: string; service: string }): Mail {
  const site = process.env.SITE_URL?.replace(/\/$/, "");
  const lien = site ? `${site}/rendez-vous/suivi?ref=${rdv.reference}` : null;
  const lignes: [string, string][] = [
    ["Référence", rdv.reference],
    ["Enfant", rdv.enfant],
    ["Date", rdv.quand],
    ["Médecin", rdv.medecin],
    ["Service", rdv.service],
  ];
  return {
    to,
    subject: `Rendez-vous enregistré — ${rdv.reference}`,
    text: [
      `Bonjour ${rdv.parent},`,
      "",
      "Votre demande de rendez-vous est bien enregistrée. Notre secrétariat va la confirmer très vite.",
      "",
      ...lignes.map(([k, v]) => `${k} : ${v}`),
      "",
      lien ? `Suivre ou annuler : ${lien}` : "Conservez votre référence pour suivre ou annuler ce rendez-vous sur notre site.",
    ].join("\n"),
    html: `<div style="${STYLE}">
  <h2 style="margin:0 0 16px">Rendez-vous enregistré 🎉</h2>
  <p>Bonjour ${escape(rdv.parent)},</p>
  <p>Votre demande de rendez-vous est bien enregistrée. Notre secrétariat va la confirmer très vite.</p>
  <table style="width:100%;background:#fff4e6;border-radius:12px;padding:12px">
    ${lignes.map(([k, v]) => `<tr><td style="color:#6c757d">${k}</td><td style="font-weight:bold;text-align:right">${escape(v)}</td></tr>`).join("")}
  </table>
  <p style="${GRIS}">${lien ? `<a href="${escape(lien)}">Suivre ou annuler ce rendez-vous</a>` : "Conservez votre référence pour suivre ou annuler ce rendez-vous sur notre site."}</p>
</div>`,
  };
}
