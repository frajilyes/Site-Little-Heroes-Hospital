import type { Metadata } from "next";
import { getActivites } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { ActivitesPlanner } from "@/components/site/ActivitesPlanner";

export const metadata: Metadata = {
  title: "Activités",
  description: "Clowns, musique, ateliers créatifs, chiens câlins : le programme de la semaine pour les enfants hospitalisés.",
};

export default async function ActivitesPage({ searchParams }: PageProps<"/activites">) {
  const { jour } = await searchParams;
  const activites = await getActivites();
  const aujourdhui = ((new Date().getDay() + 6) % 7) + 1; // 1 = lundi
  const demande = Number(jour);
  const jourInitial = Number.isInteger(demande) && demande >= 1 && demande <= 7 ? demande : aujourdhui;

  return (
    <>
      <PageHero
        emoji="🎨"
        badge={`${activites.length} activités chaque semaine`}
        titre="Le programme des petits héros"
        sousTitre="Parce que jouer, rire et créer fait partie du soin. Inscrivez votre enfant en un clic !"
        ton="soleil"
      />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <ActivitesPlanner activites={activites} jourInitial={jourInitial} aujourdhui={aujourdhui} />
      </section>
    </>
  );
}
