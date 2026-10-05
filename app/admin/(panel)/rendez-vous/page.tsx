import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { getRdvParStatut, getRendezVous } from "@/lib/data";
import { changerStatutRdv } from "@/app/actions/admin";
import { dateJour, heure, STATUTS_RDV, toISODate } from "@/lib/format";
import { COULEURS } from "@/lib/theme";
import { AdminHeader, FiltreOnglets, Recherche, Vide } from "@/components/admin/ui";
import { StatutSelect } from "@/components/admin/Toaster";
import type { StatutRdv } from "@/lib/types";

export const metadata: Metadata = { title: "Rendez-vous" };

const STATUTS = ["tous", "en_attente", "confirme", "termine", "annule"] as const;

export default async function AdminRdvPage({ searchParams }: PageProps<"/admin/rendez-vous">) {
  const sp = await searchParams;
  const statut = (STATUTS as readonly string[]).includes(String(sp.statut)) ? (String(sp.statut) as StatutRdv | "tous") : "tous";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const [rdvs, parStatut] = await Promise.all([getRendezVous(statut, q), getRdvParStatut()]);
  const compte = (s: string) => (s === "tous" ? parStatut.reduce((n, x) => n + Number(x.total), 0) : Number(parStatut.find((x) => x.statut === s)?.total ?? 0));
  const aujourdhui = toISODate(new Date());

  return (
    <>
      <AdminHeader titre="Rendez-vous" sousTitre="Confirmez, terminez ou annulez les consultations." />
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <FiltreOnglets
          base="/admin/rendez-vous"
          courant={statut}
          extra={q ? { q } : {}}
          options={STATUTS.map((s) => [s, s === "tous" ? "Tous" : STATUTS_RDV[s].label, compte(s)])}
        />
        <Recherche defaut={q} statut={statut} placeholder="Enfant, parent ou référence…" />
      </div>

      {rdvs.length === 0 ? (
        <Vide emoji="📭" texte="Aucun rendez-vous ne correspond." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-black/5 text-xs tracking-wider text-brume uppercase">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Enfant</th>
                <th className="px-5 py-4">Médecin / service</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Motif</th>
                <th className="px-5 py-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rdvs.map((r) => (
                <tr key={r.id} className={`border-b border-black/5 transition-colors last:border-0 hover:bg-creme/60 ${r.date_rdv === aujourdhui ? "bg-sky-50/60" : ""}`}>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="block font-extrabold capitalize">{r.date_rdv === aujourdhui ? "Aujourd'hui" : dateJour(r.date_rdv)}</span>
                    <span className="text-brume">{heure(r.heure)} · <span className="font-mono text-xs">{r.reference}</span></span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="block font-extrabold">{r.enfant_nom}</span>
                    <span className="text-brume">{r.enfant_age} an{r.enfant_age > 1 ? "s" : ""} · {r.parent_nom}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="block font-bold">{r.medecin_nom}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${COULEURS[r.couleur].text}`}>
                      <span className={`size-2 rounded-full ${COULEURS[r.couleur].bg}`} /> {r.service_nom}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <a href={`mailto:${r.email}`} className="flex items-center gap-1 hover:text-ciel"><Mail className="size-3.5" /> {r.email}</a>
                    <a href={`tel:${r.telephone.replace(/\s/g, "")}`} className="mt-1 flex items-center gap-1 hover:text-ciel"><Phone className="size-3.5" /> {r.telephone}</a>
                  </td>
                  <td className="max-w-56 px-5 py-4 text-brume"><span className="line-clamp-2">{r.motif}</span></td>
                  <td className="px-5 py-4">
                    <StatutSelect action={changerStatutRdv.bind(null, r.id)} value={r.statut} options={STATUTS_RDV} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
