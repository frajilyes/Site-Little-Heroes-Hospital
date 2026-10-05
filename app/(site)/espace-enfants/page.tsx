import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Blagues, Dessin, Memory } from "@/components/site/Jeux";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Espace enfants",
  description: "Jeux, dessin et blagues pour les petits héros hospitalisés.",
};

const MOTS = [
  { e: "💉", m: "La piqûre", d: "Ça pique un tout petit peu, comme une fourmi. Tu peux serrer la main de papa ou maman très fort !" },
  { e: "🩻", m: "La radio", d: "Un appareil photo magique qui voit à travers ta peau pour regarder tes os. Ça ne fait pas mal du tout." },
  { e: "😴", m: "L'anesthésie", d: "Un médicament qui te fait faire un gros dodo pendant que le docteur te soigne. Tu ne sens rien !" },
  { e: "🩺", m: "Le stéthoscope", d: "Les oreilles magiques du docteur pour écouter ton cœur faire boum-boum." },
];

export default function EspaceEnfantsPage() {
  return (
    <>
      <PageHero emoji="🦸" badge="Pour les 4 – 12 ans" titre="L'espace des petits héros" sousTitre="Des jeux pour s'amuser, un atelier dessin et plein de blagues. Et si on rigolait un peu ?" ton="lavande" />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-2">
        <Reveal><Memory /></Reveal>
        <Reveal delay={0.1}><Dessin /></Reveal>
      </section>
      <section className="mx-auto max-w-7xl px-4">
        <Reveal><Blagues /></Reveal>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-3xl font-semibold">📖 Le petit dictionnaire de l&apos;hôpital</h2>
        <p className="mt-2 text-center text-brume">Les mots des docteurs expliqués aux enfants</p>
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MOTS.map((x) => (
            <StaggerItem key={x.m} className="group card p-6 text-center transition-transform hover:-translate-y-1 hover:rotate-1">
              <div className="text-5xl transition-transform group-hover:scale-125">{x.e}</div>
              <h3 className="mt-3 text-xl font-semibold">{x.m}</h3>
              <p className="mt-2 text-sm text-brume">{x.d}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
