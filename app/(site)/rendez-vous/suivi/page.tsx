import type { Metadata } from "next";
import { CalendarClock, Search } from "lucide-react";
import { getSuiviRendezVous } from "@/lib/data";
import { dateLongue, heure, pluriel, STATUTS_RDV } from "@/lib/format";
import { adresseClient, delai, limiter } from "@/lib/rate-limit";
import { VISUELS } from "@/lib/images";
import { PageHero } from "@/components/site/PageHero";
import { AnnulationForm } from "@/components/site/AnnulationForm";

export const metadata: Metadata = { title: "Track my appointment" };

export default async function SuiviPage({ searchParams }: PageProps<"/rendez-vous/suivi">) {
  const raw = (await searchParams).ref;
  const ref = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase() ?? "";
  const valide = /^[A-Z0-9]{8}$/.test(ref);

  // The reference alone unlocks a child's name, age and appointment: it is the one
  // credential on the public site that is short enough to be worth guessing. Families
  // look theirs up once or twice, so a ceiling well above that still rules out running
  // through the reference space, and keeps the lookup off the database when someone tries.
  const limite = valide ? limiter(`suivi:${await adresseClient()}`, 20, 600) : null;
  const rdv = limite?.ok ? await getSuiviRendezVous(ref) : null;
  const annulable = rdv && (rdv.statut === "en_attente" || rdv.statut === "confirme");

  return (
    <>
      <PageHero
        photo={VISUELS.suiviRdv}
        icone="search"
        titre="Track my appointment"
        sousTitre="Enter the 8-character reference you received when booking."
      />
      <section className="mx-auto max-w-2xl px-4 py-14">
        <form className="card flex gap-3 p-3" role="search">
          <label htmlFor="ref" className="sr-only">Reference</label>
          <input
            id="ref"
            name="ref"
            defaultValue={ref}
            placeholder="e.g. K7M2Q9A1"
            maxLength={8}
            className="field font-mono text-lg tracking-widest uppercase"
            autoComplete="off"
          />
          <button className="btn btn-primaire shrink-0">
            <Search className="size-4" /> Search
          </button>
        </form>

        {limite && !limite.ok && (
          <div className="card animate-fade mt-6 p-8 text-center">
            <p className="font-semibold">Too many searches from this connection.</p>
            <p className="mt-1.5 text-sm text-brume">
              Please try again in {delai(limite.retryAfter)}, or call the front desk.
            </p>
          </div>
        )}

        {ref && !rdv && limite?.ok !== false && (
          <div className="card animate-fade mt-6 p-8 text-center">
            <p className="font-semibold">No appointment matches the reference “{ref}”.</p>
            <p className="mt-1.5 text-sm text-brume">
              Check the reference shown in your confirmation e-mail.
            </p>
          </div>
        )}

        {rdv && (
          <article className="card animate-fade mt-6 overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-bord bg-voile p-6">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-brume uppercase">Reference</p>
                <p className="font-mono text-2xl font-bold tracking-widest">{rdv.reference}</p>
              </div>
              <span className={`rounded-md px-3 py-1.5 text-[13px] font-bold ${STATUTS_RDV[rdv.statut].cls}`}>
                {STATUTS_RDV[rdv.statut].label}
              </span>
            </div>
            <dl className="grid gap-5 p-6 sm:grid-cols-2">
              <div><dt className="text-[11px] font-bold tracking-wider text-brume uppercase">Child</dt><dd className="mt-0.5 font-semibold">{rdv.enfant_nom} ({rdv.enfant_age} year{pluriel(rdv.enfant_age)} old)</dd></div>
              <div><dt className="text-[11px] font-bold tracking-wider text-brume uppercase">Department</dt><dd className="mt-0.5 font-semibold">{rdv.service_nom}</dd></div>
              <div><dt className="text-[11px] font-bold tracking-wider text-brume uppercase">Doctor</dt><dd className="mt-0.5 font-semibold">{rdv.medecin_nom}</dd></div>
              <div>
                <dt className="text-[11px] font-bold tracking-wider text-brume uppercase">Date</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 font-semibold"><CalendarClock className="size-4 text-azur" /> {dateLongue(rdv.date_rdv)} at {heure(rdv.heure)}</dd>
              </div>
            </dl>
            {/* always mounted: the success message survives the re-render that follows cancellation */}
            <AnnulationForm reference={rdv.reference} annulable={!!annulable} />
          </article>
        )}
      </section>
    </>
  );
}
