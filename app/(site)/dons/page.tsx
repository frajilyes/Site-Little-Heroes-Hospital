import type { Metadata } from "next";
import { getDerniersDons, getDonsParProjet } from "@/lib/data";
import { COULEURS, PROJETS_DONS } from "@/lib/theme";
import { euros, ilYA } from "@/lib/format";
import { VISUELS } from "@/lib/images";
import { ServiceIcon } from "@/components/ui/Icon";
import { PageHero } from "@/components/site/PageHero";
import { DonForm } from "@/components/site/DonForm";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Donate",
  description: "Support hospitalized children: play rooms, clown doctors, research, and a home for parents.",
};

export default async function DonsPage() {
  const [parProjet, derniers] = await Promise.all([getDonsParProjet(), getDerniersDons()]);
  const total = parProjet.reduce((n, p) => n + Number(p.total), 0);
  const donateurs = parProjet.reduce((n, p) => n + Number(p.nb), 0);

  return (
    <>
      <PageHero
        photo={VISUELS.dons}
        icone="heart-hands"
        badge="Hospital endowment fund"
        titre="Support hospitalized children"
        sousTitre="Your donations fund what health insurance doesn't cover: comfort, play, research, and support for families."
      >
        <div className="mt-10 flex max-w-md gap-10 border-t border-white/20 pt-6">
          <div>
            <p className="font-display text-3xl font-bold text-white"><CountUp value={total} suffix=" €" /></p>
            <p className="mt-0.5 text-[13px] font-medium text-white/70">raised to date</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-white"><CountUp value={donateurs} /></p>
            <p className="mt-0.5 text-[13px] font-medium text-white/70">donations recorded</p>
          </div>
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1fr_440px]">
        <div>
          <h2 className="text-2xl font-bold">Funded projects</h2>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-2">
            {Object.entries(PROJETS_DONS).map(([id, p]) => {
              const collecte = Number(parProjet.find((x) => x.projet === id)?.total ?? 0);
              const pct = Math.min(100, Math.round((collecte / p.objectif) * 100));
              const c = COULEURS[p.couleur];
              return (
                <StaggerItem key={id} className="card p-6">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-11 place-items-center rounded-lg ${c.soft} ${c.text}`}>
                      <ServiceIcon name={p.icone} className="size-5" />
                    </span>
                    <h3 className="text-[17px] font-bold">{p.label}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-brume">{p.description}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-voile">
                    <div className={`h-full rounded-full ${c.bg}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 flex justify-between text-[13px] font-semibold">
                    <span className={c.text}>{euros(collecte)}</span>
                    <span className="text-brume">{pct} % of {euros(p.objectif)}</span>
                  </p>
                </StaggerItem>
              );
            })}
          </Stagger>

          <h2 className="mt-12 text-2xl font-bold">Latest donations</h2>
          {derniers.length === 0 && (
            <p className="card mt-4 p-8 text-center text-sm text-brume">No donations recorded yet.</p>
          )}
          <ul className="mt-4 card divide-y divide-bord">
            {derniers.map((d, i) => {
              const projet = PROJETS_DONS[d.projet];
              return (
                <Reveal as="li" key={i} delay={i * 0.04} x={-12} y={0} className="flex items-center gap-4 p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-voile text-brume">
                    <ServiceIcon name={projet?.icone ?? "sparkle"} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{d.nom ?? "Anonymous donor"}</span>
                    <span className="block truncate text-[13px] text-brume">
                      {projet?.label ?? d.projet}
                      {d.message && ` · « ${d.message} »`}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-display text-[15px] font-bold text-encre">{euros(d.montant)}</span>
                    <span className="block text-xs text-brume">{ilYA(d.created_at)}</span>
                  </span>
                </Reveal>
              );
            })}
          </ul>
        </div>
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <DonForm />
        </div>
      </section>
    </>
  );
}
