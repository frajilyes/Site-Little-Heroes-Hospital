import type { Metadata } from "next";
import { getActualites } from "@/lib/data";
import { VISUELS } from "@/lib/images";
import { ActuCard } from "@/components/site/Cards";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "News",
  description: "News from Little Heroes Hospital: innovations, events, fundraising, and life in our departments.",
};

export default async function ActualitesPage() {
  const [une, ...autres] = await getActualites();
  return (
    <>
      <PageHero
        photo={VISUELS.actualites}
        icone="newspaper"
        titre="Hospital news"
        sousTitre="Medical innovations, renovations, fundraising events, and life in our departments."
      />
      <section className="mx-auto max-w-7xl px-4 py-14">
        {!une && <p className="card p-10 text-center text-brume">No news published yet.</p>}
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
