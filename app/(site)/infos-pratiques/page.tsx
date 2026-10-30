import type { Metadata } from "next";
import { connection } from "next/server";
import { Bus, Car, Check, Clock, Coffee, Train, Wifi } from "lucide-react";
import { VISUELS } from "@/lib/images";
import { PageHero, SectionTitle } from "@/components/site/PageHero";
import { Faq } from "@/components/site/Faq";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Practical Info",
  description: "Visiting hours, access, hospital bag checklist, services for families, and frequently asked questions.",
};

const HORAIRES = [
  { qui: "Parents", quand: "24/7", detail: "A parent can sleep in the room (a companion bed is provided)." },
  { qui: "Siblings", quand: "12pm – 8pm", detail: "From age 3, provided there's no contagious illness." },
  { qui: "Family and friends", quand: "2pm – 8pm", detail: "Two visitors maximum at a time per room." },
  { qui: "Emergency", quand: "24/7", detail: "Only one companion is allowed with the child." },
];

const VALISE = [
  "A comfort toy or blanket",
  "Pajamas and comfortable clothes",
  "Toiletries bag",
  "Non-slip slippers",
  "Health record booklet",
  "Insurance card and proof of coverage",
  "Books, games, tablet",
  "Phone charger",
];

const FAQ = [
  { q: "Can I stay and sleep next to my child?", r: "Yes! Every room has a companion bed for one parent. A Parents' House is also available 200 m away for families coming from afar." },
  { q: "Can my child keep up with school?", r: "Yes, the hospital school welcomes children from preschool through high school, in a classroom or in their room. Teachers stay in touch with the child's regular school." },
  { q: "What happens during an operation?", r: "A tour of the operating ward is offered before the procedure. On the day, your child can ride down in a little electric car, and you stay with them until they fall asleep." },
  { q: "Are meals suited to allergies?", r: "Absolutely. Our dietitians adapt every meal to allergies, special diets, and cultural preferences. Let us know at admission." },
  { q: "How do I sign my child up for activities?", r: "Directly from the Activities page on the site, or with the activities team in the department. All activities are free." },
  { q: "What should I do in a night-time emergency?", r: "Call 15 or come directly to the pediatric emergency department (ground floor, wing A), open 24/7." },
];

export default async function InfosPage() {
  // Rendered per request so the CSP nonce exists (see proxy.ts).
  await connection();
  return (
    <>
      <PageHero
        photo={VISUELS.infosPratiques}
        icone="map-pin"
        titre="Practical information"
        sousTitre="Visiting hours, access, what to bring, and answers to the most frequently asked questions."
      />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <Reveal><SectionTitle kicker="Visits" titre="Visiting hours" /></Reveal>
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HORAIRES.map((h) => (
            <StaggerItem key={h.qui} className="card p-6">
              <h3 className="text-[17px] font-bold">{h.qui}</h3>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-azur/10 px-2.5 py-1 font-display text-sm font-bold text-azur">
                <Clock className="size-4" /> {h.quand}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-brume">{h.detail}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2">
          <Reveal>
            <SectionTitle center={false} kicker="Preparing for the stay" titre="What to bring" texte="A checklist so nothing gets forgotten — starting with the child's comfort item." />
            <ul className="mt-8 grid gap-2 sm:grid-cols-2">
              {VALISE.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-encre">
                  <Check className="mt-0.5 size-4 shrink-0 text-menthe" /> {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionTitle center={false} kicker="Access" titre="Getting to the hospital" />
            <div className="mt-8 grid gap-3">
              {[
                { i: <Train className="size-5" />, t: "Subway", d: "Line 7 — Little Heroes station (exit 2)" },
                { i: <Bus className="size-5" />, t: "Bus", d: "Lines 21, 47, and 83 — Hospital stop" },
                { i: <Car className="size-5" />, t: "Parking", d: "Free for parents of hospitalized children" },
                { i: <Coffee className="size-5" />, t: "Cafeteria", d: "Ground floor, 7am to 9pm" },
                { i: <Wifi className="size-5" />, t: "Wi-Fi", d: "Free throughout the hospital (network \"LittleHeroes\")" },
              ].map((x) => (
                <div key={x.t} className="flex items-center gap-4 rounded-lg border border-bord bg-creme p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-azur">{x.i}</span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold">{x.t}</span>
                    <span className="block text-sm text-brume">{x.d}</span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <Reveal><SectionTitle kicker="FAQ" titre="Frequently asked questions" /></Reveal>
        <div className="mt-10">
          <Faq items={FAQ} />
        </div>
      </section>
    </>
  );
}
