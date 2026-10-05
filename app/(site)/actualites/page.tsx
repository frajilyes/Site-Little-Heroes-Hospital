import type { Metadata } from "next";
import { getActualites } from "@/lib/data";
import { ActuCard } from "@/components/site/Cards";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Les nouvelles de l'Hôpital des Petits Héros : innovations, événements, solidarité et vie des services.",
};

export default async function ActualitesPage() {
  const [une, ...autres] = await getActualites();
  return (
    <>
      <PageHero emoji="📰" titre="Les actualités de l'hôpital" sousTitre="Innovations, événements solidaires et petits bonheurs du quotidien." ton="lavande" />
      <section className="mx-auto max-w-7xl px-4 py-12">
        {!une && <p className="card p-10 text-center font-bold text-brume">Aucune actualité pour le moment.</p>}
        {une && (
          <Reveal>
            <ActuCard actu={une} large />
          </Reveal>
        )}
        <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {autres.map((a) => (
            <StaggerItem key={a.id}>
              <ActuCard actu={a} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
