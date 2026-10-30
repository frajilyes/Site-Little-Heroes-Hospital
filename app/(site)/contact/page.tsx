import type { Metadata } from "next";
import { connection } from "next/server";
import { AlertTriangle, Clock, Mail, MapPin, Phone } from "lucide-react";
import { VISUELS } from "@/lib/images";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/site/ContactForm";
import { Reveal } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Contact",
  description: "A question? Write to the Little Heroes Hospital team.",
};

export default async function ContactPage() {
  // Rendered per request so the CSP nonce exists. Prerendered HTML carries no nonce, and
  // the strict policy in proxy.ts would then block the page's own scripts.
  await connection();
  return (
    <>
      <PageHero
        photo={VISUELS.contact}
        icone="mail"
        titre="Contact us"
        sousTitre="A question about a stay, an administrative matter, feedback: our patient relations team replies within 48 business hours."
      />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1fr_340px]">
        <Reveal>
          <ContactForm />
        </Reveal>
        <Reveal delay={0.1} className="grid h-fit gap-4">
          {[
            { i: <Phone className="size-5" />, t: "Phone", d: "01 23 45 67 00" },
            { i: <Mail className="size-5" />, t: "E-mail", d: "contact@petitsheros.fr" },
            { i: <MapPin className="size-5" />, t: "Address", d: "12 Little Heroes Street, 75000 Paris" },
            { i: <Clock className="size-5" />, t: "Opening hours", d: "Mon – Fri: 8am – 7pm · Sat: 9am – 1pm" },
          ].map((x) => (
            <div key={x.t} className="card flex items-center gap-4 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-azur/10 text-azur">{x.i}</span>
              <span className="min-w-0">
                <span className="block text-[11px] font-bold tracking-wider text-brume uppercase">{x.t}</span>
                <span className="block text-[15px] font-semibold">{x.d}</span>
              </span>
            </div>
          ))}
          <div className="rounded-xl border border-corail/25 bg-corail/5 p-5">
            <p className="flex items-center gap-2 font-display text-[15px] font-bold text-corail">
              <AlertTriangle className="size-5" /> In case of emergency
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-brume">
              Do not use this form. Call <strong className="text-encre">15</strong> or go directly to the
              pediatric emergency department, open 24/7.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
