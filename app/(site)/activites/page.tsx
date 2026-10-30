import type { Metadata } from "next";
import { getActivites } from "@/lib/data";
import { VISUELS } from "@/lib/images";
import { PageHero } from "@/components/site/PageHero";
import { ActivitesPlanner } from "@/components/site/ActivitesPlanner";

export const metadata: Metadata = {
  title: "Activities",
  description: "Clowns, music, creative workshops, therapy dogs: this week's program for hospitalized children.",
};

export default async function ActivitesPage({ searchParams }: PageProps<"/activites">) {
  const { jour } = await searchParams;
  const activites = await getActivites();
  const aujourdhui = ((new Date().getDay() + 6) % 7) + 1; // 1 = Monday
  const demande = Number(jour);
  const jourInitial = Number.isInteger(demande) && demande >= 1 && demande <= 7 ? demande : aujourdhui;

  return (
    <>
      <PageHero
        photo={VISUELS.activites}
        icone="palette"
        badge={activites.length ? `${activites.length} activit${activites.length > 1 ? "ies" : "y"} every week` : undefined}
        titre="Activity program"
        sousTitre="Playing, creating, and laughing are part of care. Sessions are free, led by professionals, and sign-up is online."
      />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <ActivitesPlanner activites={activites} jourInitial={jourInitial} aujourdhui={aujourdhui} />
      </section>
    </>
  );
}
