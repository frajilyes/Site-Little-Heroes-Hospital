import type { Metadata } from "next";
import { Phone, TriangleAlert } from "lucide-react";
import { getMedecins, getPatients, getServices } from "@/lib/data";
import { changerStatutPatient } from "@/app/actions/admin";
import { dateCourte, STATUTS_PATIENT, toISODate } from "@/lib/format";
import { COULEURS } from "@/lib/theme";
import { AdminHeader, FiltreOnglets, Recherche, Vide } from "@/components/admin/ui";
import { AdmissionButton } from "@/components/admin/AdmissionForm";
import { StatutSelect } from "@/components/admin/Toaster";
import { Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = { title: "Patients" };

const FILTRES = ["actifs", "hospitalise", "observation", "sorti", "tous"] as const;

export default async function PatientsPage({ searchParams }: PageProps<"/admin/patients">) {
  const sp = await searchParams;
  const filtre = (FILTRES as readonly string[]).includes(String(sp.statut)) ? String(sp.statut) : "actifs";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const [patients, services, medecins] = await Promise.all([
    getPatients(filtre === "actifs" ? undefined : filtre, q),
    getServices(),
    getMedecins(),
  ]);
  const aujourdhui = toISODate(new Date());

  return (
    <>
      <AdminHeader titre="Patients" sousTitre="Suivi des enfants hospitalisés et en observation.">
        <AdmissionButton
          services={services.map((s) => ({ id: s.id, nom: s.nom }))}
          medecins={medecins.map((d) => ({ id: d.id, nom: `${d.titre} ${d.prenom} ${d.nom}`, service_id: d.service_id }))}
        />
      </AdminHeader>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <FiltreOnglets
          base="/admin/patients"
          courant={filtre}
          extra={q ? { q } : {}}
          options={[["actifs", "Présents"], ["hospitalise", "Hospitalisés"], ["observation", "Observation"], ["sorti", "Sortis"], ["tous", "Tous"]]}
        />
        <Recherche defaut={q} statut={filtre} placeholder="Nom, prénom ou chambre…" />
      </div>

      {patients.length === 0 ? (
        <Vide emoji="🛏️" texte="Aucun patient ne correspond." />
      ) : (
        <Stagger className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" gap={0.04}>
          {patients.map((p) => {
            const c = COULEURS[p.couleur];
            const sortieAujourdhui = p.statut !== "sorti" && p.date_sortie_prevue && p.date_sortie_prevue <= aujourdhui;
            return (
              <StaggerItem key={p.id} className="card flex flex-col p-5">
                <div className="flex items-start gap-4">
                  <span className={`grid size-14 shrink-0 place-items-center rounded-2xl text-2xl ${c.soft}`}>
                    {p.age < 2 ? "👶" : p.sexe === "F" ? "👧" : "👦"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-display text-lg font-semibold">{p.prenom} {p.nom}</h2>
                    <p className="text-sm text-brume">
                      {p.age < 1 ? "Nouveau-né" : `${p.age} an${p.age > 1 ? "s" : ""}`} · Chambre <strong className="text-encre">{p.chambre}</strong>
                    </p>
                    <p className={`mt-1 inline-flex items-center gap-1.5 text-xs font-bold ${c.text}`}>
                      <span className={`size-2 rounded-full ${c.bg}`} /> {p.service_nom}
                    </p>
                  </div>
                  <StatutSelect action={changerStatutPatient.bind(null, p.id)} value={p.statut} options={STATUTS_PATIENT} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl bg-creme p-4 text-xs">
                  <div><dt className="font-bold text-brume">Admission</dt><dd className="font-extrabold">{dateCourte(p.date_admission)}</dd></div>
                  <div>
                    <dt className="font-bold text-brume">Sortie prévue</dt>
                    <dd className={`font-extrabold ${sortieAujourdhui ? "text-corail" : ""}`}>{p.date_sortie_prevue ? dateCourte(p.date_sortie_prevue) : "—"}{sortieAujourdhui ? " · à faire" : ""}</dd>
                  </div>
                  <div><dt className="font-bold text-brume">Médecin</dt><dd className="truncate font-extrabold">{p.medecin_nom ?? "—"}</dd></div>
                  <div><dt className="font-bold text-brume">Groupe</dt><dd className="font-extrabold">{p.groupe_sanguin ?? "—"}</dd></div>
                </dl>
                {p.allergies && (
                  <p className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-700">
                    <TriangleAlert className="size-4" /> Allergie : {p.allergies}
                  </p>
                )}
                <a href={`tel:${p.parent_tel.replace(/\s/g, "")}`} className="mt-3 flex items-center gap-2 text-xs font-bold text-brume hover:text-ciel">
                  <Phone className="size-3.5" /> {p.parent_nom} · {p.parent_tel}
                </a>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </>
  );
}
