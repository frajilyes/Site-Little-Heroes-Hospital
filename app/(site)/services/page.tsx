import type { Metadata } from "next";
import { getServices } from "@/lib/data";
import { pluriel } from "@/lib/format";
import { VISUELS } from "@/lib/images";
import { ServiceCard } from "@/components/site/Cards";
import { PageHero } from "@/components/site/PageHero";
import { Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Our Departments",
  description: "The hospital's specialized departments, from birth to adolescence.",
};

export default async function ServicesPage() {
  const services = await getServices();
  const lits = services.reduce((n, s) => n + s.lits_total, 0);
  const occupes = services.reduce((n, s) => n + s.lits_occupes, 0);
  const taux = lits ? Math.round((occupes / lits) * 100) : 0;

  return (
    <>
      <PageHero
        photo={VISUELS.services}
        icone="stethoscope"
        badge={services.length ? `${services.length} department${pluriel(services.length)} · ${lits} beds` : undefined}
        titre="Our specialized departments"
        sousTitre="From birth to adolescence, expert teams brought together on a single hospital site."
      >
        {lits > 0 && (
          <div className="mt-10 max-w-md border-t border-white/20 pt-6">
            <p className="flex items-center justify-between text-[13px] font-medium text-white/75">
              <span>Real-time bed occupancy</span>
              <span className="font-display font-bold text-white">
                {occupes}/{lits} · {taux} %
              </span>
            </p>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-ciel" style={{ width: `${taux}%` }} />
            </div>
          </div>
        )}
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-14">
        {services.length === 0 && (
          <p className="card p-10 text-center text-brume">No departments are registered yet.</p>
        )}
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
