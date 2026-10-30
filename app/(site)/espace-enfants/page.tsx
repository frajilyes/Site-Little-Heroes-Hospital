import type { Metadata } from "next";
import { connection } from "next/server";
import { VISUELS } from "@/lib/images";
import { PageHero } from "@/components/site/PageHero";
import { Blagues, Dessin, Memory } from "@/components/site/Jeux";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Kids' Corner",
  description: "Games, drawing, and jokes for little heroes in the hospital.",
};

const MOTS = [
  { e: "💉", m: "The shot", d: "It stings just a tiny bit, like an ant bite. You can squeeze mom or dad's hand really hard!" },
  { e: "🩻", m: "The X-ray", d: "A magic camera that sees through your skin to look at your bones. It doesn't hurt at all." },
  { e: "😴", m: "Anesthesia", d: "A medicine that gives you a big nap while the doctor takes care of you. You don't feel a thing!" },
  { e: "🩺", m: "The stethoscope", d: "The doctor's magic ears for listening to your heart go thump-thump." },
];

export default async function EspaceEnfantsPage() {
  // Rendered per request so the CSP nonce exists (see proxy.ts).
  await connection();
  return (
    <>
      <PageHero
        photo={VISUELS.espaceEnfants}
        icone="dices"
        badge="For ages 4 – 12"
        titre="The little heroes' corner"
        sousTitre="Games, a drawing workshop, jokes, and a dictionary to understand the doctors' words."
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-2">
        <Reveal><Memory /></Reveal>
        <Reveal delay={0.1}><Dessin /></Reveal>
      </section>
      <section className="mx-auto max-w-7xl px-4">
        <Reveal><Blagues /></Reveal>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">The hospital’s little dictionary</h2>
        <p className="mt-2 text-center text-brume">The doctors’ words, explained to kids</p>
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MOTS.map((x) => (
            <StaggerItem key={x.m} className="group card p-6 text-center">
              <div className="text-4xl transition-transform group-hover:scale-110">{x.e}</div>
              <h3 className="mt-3 text-lg font-bold">{x.m}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brume">{x.d}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
