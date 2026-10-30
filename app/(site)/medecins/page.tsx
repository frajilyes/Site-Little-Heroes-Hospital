import type { Metadata } from "next";
import { getMedecins, getServices } from "@/lib/data";
import { pluriel } from "@/lib/format";
import { VISUELS } from "@/lib/images";
import { PageHero } from "@/components/site/PageHero";
import { MedecinsExplorer } from "@/components/site/MedecinsExplorer";

export const metadata: Metadata = {
  title: "Our Doctors",
  description: "Meet the pediatricians and specialists at Little Heroes Hospital and book an appointment online.",
};

export default async function MedecinsPage() {
  const [medecins, services] = await Promise.all([getMedecins(), getServices()]);
  return (
    <>
      <PageHero
        photo={VISUELS.medecins}
        icone="users"
        badge={medecins.length ? `${medecins.length} practitioner${pluriel(medecins.length)}` : undefined}
        titre="Directory of practitioners"
        sousTitre="Pediatricians, surgeons, psychologists: background, languages spoken, and availability for every team member."
      />
      <section className="mx-auto max-w-7xl px-4 py-14">
        <MedecinsExplorer medecins={medecins} services={services} />
      </section>
    </>
  );
}
