import type { Metadata } from "next";
import { getServices } from "@/lib/data";
import { ServiceCard } from "@/components/site/Cards";
import { PageHero } from "@/components/site/PageHero";
import { Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Nos services",
  description: "Urgences, néonatologie, cardiologie, chirurgie, hémato-oncologie, neurologie, pneumologie et pédopsychiatrie.",
};

export default async function ServicesPage() {
  const services = await getServices();
  const lits = services.reduce((n, s) => n + s.lits_total, 0);
  const occupes = services.reduce((n, s) => n + s.lits_occupes, 0);

  return (
    <>
      <PageHero
        emoji="🏥"
        badge={`${services.length} services · ${lits} lits`}
        titre="Nos services spécialisés"
        sousTitre="De la naissance à l'adolescence, des équipes expertes et bienveillantes prennent soin de votre enfant."
        ton="ciel"
      >
        <div className="mx-auto mt-8 flex max-w-md items-center gap-4 rounded-2xl bg-white/80 p-4 text-left backdrop-blur">
          <span className="text-3xl">🛏️</span>
          <div className="flex-1">
            <p className="text-sm font-extrabold">Occupation actuelle des lits</p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-sky-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-ciel transition-all"
                style={{ width: `${Math.round((occupes / lits) * 100)}%` }}
              />
            </div>
          </div>
          <span className="font-display text-xl font-semibold">{Math.round((occupes / lits) * 100)}%</span>
        </div>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <StaggerItem key={s.id}>
              <ServiceCard service={s} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
