import type { Metadata } from "next";
import { CalendarClock, Search } from "lucide-react";
import { getRendezVousByReference } from "@/lib/data";
import { dateLongue, heure, STATUTS_RDV } from "@/lib/format";
import { PageHero } from "@/components/site/PageHero";
import { AnnulationForm } from "@/components/site/AnnulationForm";

export const metadata: Metadata = { title: "Suivre mon rendez-vous" };

export default async function SuiviPage({ searchParams }: PageProps<"/rendez-vous/suivi">) {
  const raw = (await searchParams).ref;
  const ref = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase() ?? "";
  const valide = /^[A-Z0-9]{8}$/.test(ref);
  const rdv = valide ? await getRendezVousByReference(ref) : null;
  const annulable = rdv && (rdv.statut === "en_attente" || rdv.statut === "confirme");

  return (
    <>
      <PageHero emoji="🔎" titre="Suivre mon rendez-vous" sousTitre="Saisissez la référence à 8 caractères reçue lors de votre réservation." ton="lavande" />
      <section className="mx-auto max-w-2xl px-4 py-12">
        <form className="card flex gap-3 p-3" role="search">
          <label htmlFor="ref" className="sr-only">Référence</label>
          <input
            id="ref"
            name="ref"
            defaultValue={ref}
            placeholder="ex : K7M2Q9A1"
            maxLength={8}
            className="field font-mono text-lg tracking-widest uppercase"
            autoComplete="off"
          />
          <button className="btn shrink-0 bg-encre text-white">
            <Search className="size-4" /> Rechercher
          </button>
        </form>

        {ref && !rdv && (
          <div className="card mt-6 animate-pop p-8 text-center">
            <p className="text-5xl">🤔</p>
            <p className="mt-3 font-bold">Aucun rendez-vous ne correspond à « {ref} ».</p>
          </div>
        )}

        {rdv && (
          <article className="card mt-6 animate-pop overflow-hidden">
            <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-violet-100 to-sky-100 p-6">
              <div>
                <p className="text-xs font-extrabold tracking-widest text-brume uppercase">Référence</p>
                <p className="font-mono text-2xl font-bold tracking-widest">{rdv.reference}</p>
              </div>
              <span className={`rounded-full px-4 py-1.5 text-sm font-extrabold ${STATUTS_RDV[rdv.statut].cls}`}>
                {STATUTS_RDV[rdv.statut].label}
              </span>
            </div>
            <dl className="grid gap-4 p-6 sm:grid-cols-2">
              <div><dt className="text-xs font-extrabold text-brume uppercase">Enfant</dt><dd className="font-bold">{rdv.enfant_nom} ({rdv.enfant_age} an{rdv.enfant_age > 1 ? "s" : ""})</dd></div>
              <div><dt className="text-xs font-extrabold text-brume uppercase">Service</dt><dd className="font-bold">{rdv.service_nom}</dd></div>
              <div><dt className="text-xs font-extrabold text-brume uppercase">Médecin</dt><dd className="font-bold">{rdv.medecin_nom}</dd></div>
              <div>
                <dt className="text-xs font-extrabold text-brume uppercase">Date</dt>
                <dd className="flex items-center gap-1.5 font-bold"><CalendarClock className="size-4 text-corail" /> {dateLongue(rdv.date_rdv)} à {heure(rdv.heure)}</dd>
              </div>
            </dl>
            {/* toujours monté : le message de succès survit au re-rendu qui suit l'annulation */}
            <AnnulationForm reference={rdv.reference} annulable={!!annulable} />
          </article>
        )}
      </section>
    </>
  );
}
