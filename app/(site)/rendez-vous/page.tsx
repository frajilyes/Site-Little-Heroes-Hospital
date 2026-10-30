import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Search, ShieldCheck } from "lucide-react";
import { getMedecins, getServices } from "@/lib/data";
import { VISUELS } from "@/lib/images";
import { PageHero } from "@/components/site/PageHero";
import { RdvWizard } from "@/components/site/RdvWizard";

export const metadata: Metadata = {
  title: "Book an appointment",
  description: "Book a pediatric consultation online, with real-time availability.",
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
        photo={VISUELS.rendezVous}
        icone="calendar"
        badge="Real-time availability"
        titre="Book an appointment"
        sousTitre="Four steps to book a consultation. In an emergency, go directly to the pediatric emergency department or call 15."
      />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1fr_280px]">
        <RdvWizard
          services={services}
          medecins={medecins}
          serviceInitial={services.some((s) => s.id === serviceInitial) ? serviceInitial : null}
          medecinInitial={entier(sp.medecin)}
        />
        <aside className="grid h-fit gap-4">
          <div className="card p-5">
            <Search className="size-5 text-azur" />
            <h2 className="mt-2.5 font-display text-[15px] font-bold">Already have an appointment?</h2>
            <p className="mt-1 text-sm leading-relaxed text-brume">
              Check its status or cancel it using your reference.
            </p>
            <Link href="/rendez-vous/suivi" className="btn btn-secondaire mt-4 w-full text-sm">
              Track my appointment
            </Link>
          </div>
          <div className="rounded-xl border border-corail/25 bg-corail/5 p-5">
            <Phone className="size-5 text-corail" />
            <h2 className="mt-2.5 font-display text-[15px] font-bold text-corail">In an emergency</h2>
            <p className="mt-1 text-sm leading-relaxed text-brume">
              Don’t wait for a slot: call <strong className="text-encre">15</strong> or come to the
              pediatric emergency department, open 24/7.
            </p>
          </div>
          <div className="card p-5">
            <ShieldCheck className="size-5 text-menthe" />
            <h2 className="mt-2.5 font-display text-[15px] font-bold">Protected data</h2>
            <p className="mt-1 text-sm leading-relaxed text-brume">
              Your information is confidential and is only used to organize the consultation.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
