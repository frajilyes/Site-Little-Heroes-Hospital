import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

// Shared SMTP transport (Gmail, OVH, Mailtrap…), configured via .env (or .env.local).
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

/** Sends an e-mail. Without SMTP configured, prints it to the console in development. */
export async function sendMail(mail: Mail): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    if (process.env.NODE_ENV === "production") throw new Error("SMTP_HOST missing: unable to send e-mails.");
    console.info(`\n📧 [e-mail not sent — SMTP not configured]\n   To: ${mail.to}\n   Subject: ${mail.subject}\n${mail.text}\n`);
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

/** 6-digit code sent to confirm an action (login, appointment, cancellation). */
export function mailCode({ to, code, minutes, pour, nom, alerte }: {
  to: string;
  code: string;
  minutes: number;
  pour: string;
  nom?: string;
  alerte?: string;
}): Mail {
  const bonjour = nom ? `Hello ${nom},` : "Hello,";
  const avertissement = alerte ?? "If you didn't request this, simply ignore this e-mail.";
  return {
    to,
    subject: `${code} is your confirmation code`,
    text: [bonjour, "", `Here is the code to ${pour}: ${code}`, `It expires in ${minutes} minutes.`, "", avertissement].join("\n"),
    html: `<div style="${STYLE}">
  <h2 style="margin:0 0 16px">Little Heroes Hospital</h2>
  <p>${escape(bonjour)}</p>
  <p>Here is the code to ${escape(pour)}:</p>
  <p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;background:#fff4e6;border-radius:12px;padding:16px">${code}</p>
  <p style="${GRIS}">This code expires in ${minutes} minutes. Do not share it with anyone.</p>
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
    pour: "log in to the staff area",
    alerte: "If you didn't request this, someone knows your password: change it right away.",
  });
}

/** Summary sent once the appointment is confirmed by the code. */
export function mailRecapRdv(to: string, rdv: { reference: string; parent: string; enfant: string; quand: string; medecin: string; service: string }): Mail {
  const site = process.env.SITE_URL?.replace(/\/$/, "");
  const lien = site ? `${site}/rendez-vous/suivi?ref=${rdv.reference}` : null;
  const lignes: [string, string][] = [
    ["Reference", rdv.reference],
    ["Child", rdv.enfant],
    ["Date", rdv.quand],
    ["Doctor", rdv.medecin],
    ["Department", rdv.service],
  ];
  return {
    to,
    subject: `Appointment booked — ${rdv.reference}`,
    text: [
      `Hello ${rdv.parent},`,
      "",
      "Your appointment request has been recorded. Our front desk will confirm it very soon.",
      "",
      ...lignes.map(([k, v]) => `${k}: ${v}`),
      "",
      lien ? `Track or cancel: ${lien}` : "Keep your reference to track or cancel this appointment on our site.",
    ].join("\n"),
    html: `<div style="${STYLE}">
  <h2 style="margin:0 0 16px">Appointment booked 🎉</h2>
  <p>Hello ${escape(rdv.parent)},</p>
  <p>Your appointment request has been recorded. Our front desk will confirm it very soon.</p>
  <table style="width:100%;background:#fff4e6;border-radius:12px;padding:12px">
    ${lignes.map(([k, v]) => `<tr><td style="color:#6c757d">${k}</td><td style="font-weight:bold;text-align:right">${escape(v)}</td></tr>`).join("")}
  </table>
  <p style="${GRIS}">${lien ? `<a href="${escape(lien)}">Track or cancel this appointment</a>` : "Keep your reference to track or cancel this appointment on our site."}</p>
</div>`,
  };
}
