import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/site/ContactForm";
import { Reveal } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question ? Écrivez à l'équipe de l'Hôpital des Petits Héros.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero emoji="💌" titre="Contactez-nous" sousTitre="Une question, une suggestion, un merci ? Notre équipe vous répond sous 48 h." ton="corail" />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1fr_340px]">
        <Reveal>
          <ContactForm />
        </Reveal>
        <Reveal delay={0.1} className="grid h-fit gap-4">
          {[
            { i: <Phone className="size-5" />, t: "Standard", d: "01 23 45 67 00", c: "bg-rose-100 text-rose-600" },
            { i: <Mail className="size-5" />, t: "E-mail", d: "contact@petitsheros.fr", c: "bg-sky-100 text-sky-600" },
            { i: <MapPin className="size-5" />, t: "Adresse", d: "12 rue des Petits Héros, 75000 Paris", c: "bg-emerald-100 text-emerald-700" },
            { i: <Clock className="size-5" />, t: "Accueil", d: "Lun – Ven : 8h – 19h · Sam : 9h – 13h", c: "bg-amber-100 text-amber-700" },
          ].map((x) => (
            <div key={x.t} className="card flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5">
              <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${x.c}`}>{x.i}</span>
              <span>
                <span className="block text-xs font-extrabold tracking-wider text-brume uppercase">{x.t}</span>
                <span className="block font-bold">{x.d}</span>
              </span>
            </div>
          ))}
          <div className="card bg-encre p-5 text-white">
            <p className="font-display text-lg font-semibold">🚨 Une urgence ?</p>
            <p className="mt-1 text-sm text-white/80">N&apos;utilisez pas ce formulaire : appelez le 15 ou rendez-vous aux urgences.</p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
