import type { Metadata } from "next";
import { getDerniersDons, getDonsParProjet } from "@/lib/data";
import { COULEURS, PROJETS_DONS } from "@/lib/theme";
import { euros, ilYA } from "@/lib/format";
import { PageHero } from "@/components/site/PageHero";
import { DonForm } from "@/components/site/DonForm";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Faire un don",
  description: "Soutenez les enfants hospitalisés : salles de jeux, docteurs clowns, recherche et maison des parents.",
};

export default async function DonsPage() {
  const [parProjet, derniers] = await Promise.all([getDonsParProjet(), getDerniersDons()]);
  const total = parProjet.reduce((n, p) => n + Number(p.total), 0);
  const donateurs = parProjet.reduce((n, p) => n + Number(p.nb), 0);

  return (
    <>
      <PageHero emoji="💛" badge="Chaque euro compte" titre="Offrez des sourires" sousTitre="Vos dons financent tout ce qui rend l'hôpital plus doux pour les enfants et leurs familles." ton="soleil">
        <div className="mx-auto mt-8 flex max-w-md justify-center gap-4">
          <div className="flex-1 rounded-2xl bg-white/80 p-4 backdrop-blur">
            <p className="font-display text-3xl font-semibold text-corail"><CountUp value={total} suffix=" €" /></p>
            <p className="text-xs font-extrabold text-brume uppercase">collectés</p>
          </div>
          <div className="flex-1 rounded-2xl bg-white/80 p-4 backdrop-blur">
            <p className="font-display text-3xl font-semibold text-ciel"><CountUp value={donateurs} /></p>
            <p className="text-xs font-extrabold text-brume uppercase">dons</p>
          </div>
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_440px]">
        <div>
          <h2 className="text-3xl font-semibold">Nos projets</h2>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-2">
            {Object.entries(PROJETS_DONS).map(([id, p]) => {
              const collecte = Number(parProjet.find((x) => x.projet === id)?.total ?? 0);
              const pct = Math.min(100, Math.round((collecte / p.objectif) * 100));
              const c = COULEURS[p.couleur];
              return (
                <StaggerItem key={id} className="card p-6">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-12 place-items-center rounded-2xl text-2xl ${c.soft}`}>{p.emoji}</span>
                    <h3 className="text-lg font-semibold">{p.label}</h3>
                  </div>
                  <p className="mt-3 text-sm text-brume">{p.description}</p>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full bg-gradient-to-r ${c.grad}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 flex justify-between text-xs font-extrabold">
                    <span className={c.text}>{euros(collecte)}</span>
                    <span className="text-brume">{pct}% de {euros(p.objectif)}</span>
                  </p>
                </StaggerItem>
              );
            })}
          </Stagger>

          <h2 className="mt-12 text-2xl font-semibold">Les derniers dons</h2>
          <ul className="mt-4 grid gap-2">
            {derniers.map((d, i) => (
              <Reveal as="li" key={i} delay={i * 0.05} x={-20} y={0} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                <span className="text-2xl">{PROJETS_DONS[d.projet]?.emoji ?? "💛"}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold">{d.nom ?? "Donateur anonyme"}</span>
                  {d.message && <span className="block truncate text-sm text-brume">« {d.message} »</span>}
                </span>
                <span className="text-right">
                  <span className="block font-display text-lg font-semibold text-corail">{euros(d.montant)}</span>
                  <span className="block text-xs text-brume">{ilYA(d.created_at)}</span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <DonForm />
        </div>
      </section>
    </>
  );
}
