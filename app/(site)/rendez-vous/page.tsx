import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Search, ShieldCheck } from "lucide-react";
import { getMedecins, getServices } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { RdvWizard } from "@/components/site/RdvWizard";

export const metadata: Metadata = {
  title: "Prendre rendez-vous",
  description: "Réservez une consultation pédiatrique en ligne, avec les disponibilités en temps réel.",
};

const entier = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export default async function RendezVousPage({ searchParams }: PageProps<"/rendez-vous">) {
  const sp = await searchParams;
  const [services, medecins] = await Promise.all([getServices(), getMedecins()]);
  const serviceInitial = entier(sp.service);

  return (
    <>
      <PageHero
        emoji="📅"
        badge="Disponibilités en temps réel"
        titre="Prendre rendez-vous"
        sousTitre="Quatre petites étapes et c'est réservé. Pour une urgence, rendez-vous directement aux urgences ou appelez le 15."
        ton="corail"
      />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1fr_280px]">
        <RdvWizard
          services={services}
          medecins={medecins}
          serviceInitial={services.some((s) => s.id === serviceInitial) ? serviceInitial : null}
          medecinInitial={entier(sp.medecin)}
        />
        <aside className="grid h-fit gap-4">
          <div className="card p-5">
            <Search className="size-6 text-ciel" />
            <h2 className="mt-2 font-display text-lg font-semibold">Déjà un rendez-vous ?</h2>
            <p className="mt-1 text-sm text-brume">Suivez son statut ou annulez-le avec votre référence.</p>
            <Link href="/rendez-vous/suivi" className="btn mt-4 w-full bg-creme text-encre">
              Suivre mon RDV
            </Link>
          </div>
          <div className="card bg-rose-50 p-5">
            <Phone className="size-6 text-corail" />
            <h2 className="mt-2 font-display text-lg font-semibold">Urgence ?</h2>
            <p className="mt-1 text-sm text-brume">
              N&apos;attendez pas : appelez le <strong>15</strong> ou venez aux urgences pédiatriques, ouvertes 24h/24.
            </p>
          </div>
          <div className="card p-5">
            <ShieldCheck className="size-6 text-menthe" />
            <h2 className="mt-2 font-display text-lg font-semibold">Données protégées</h2>
            <p className="mt-1 text-sm text-brume">Vos informations restent confidentielles et ne servent qu&apos;à organiser la consultation.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
