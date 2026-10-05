import type { Metadata } from "next";
import { getMedecins, getServices } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { MedecinsExplorer } from "@/components/site/MedecinsExplorer";

export const metadata: Metadata = {
  title: "Nos médecins",
  description: "Découvrez les pédiatres et spécialistes de l'Hôpital des Petits Héros et prenez rendez-vous en ligne.",
};

export default async function MedecinsPage() {
  const [medecins, services] = await Promise.all([getMedecins(), getServices()]);
  return (
    <>
      <PageHero
        emoji="🩺"
        badge={`${medecins.length} spécialistes`}
        titre="Des médecins au grand cœur"
        sousTitre="Pédiatres, chirurgiens, psychologues : rencontrez les équipes qui prennent soin de votre enfant."
        ton="menthe"
      />
      <section className="mx-auto max-w-7xl px-4 py-12">
        <MedecinsExplorer medecins={medecins} services={services} />
      </section>
    </>
  );
}
