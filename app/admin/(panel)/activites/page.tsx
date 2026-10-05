import type { Metadata } from "next";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { getAllActivites, getInscriptions } from "@/lib/data";
import { basculerActivite, supprimerInscription } from "@/app/actions/admin";
import { dateJour, heure, jourNom } from "@/lib/format";
import { CATEGORIES, COULEURS } from "@/lib/theme";
import { AdminHeader, Vide } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/Toaster";
import { NouvelleActivite } from "@/components/admin/CreateForms";

export const metadata: Metadata = { title: "Activités" };

export default async function AdminActivitesPage() {
  const [activites, inscriptions] = await Promise.all([getAllActivites(), getInscriptions()]);

  return (
    <>
      <AdminHeader titre="Activités" sousTitre="Programme hebdomadaire et inscriptions à venir.">
        <NouvelleActivite />
      </AdminHeader>

      <div className="grid gap-6 2xl:grid-cols-[1.4fr_1fr]">
        <section className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-black/5 text-xs tracking-wider text-brume uppercase">
              <tr>
                <th className="px-5 py-4">Activité</th>
                <th className="px-5 py-4">Créneau</th>
                <th className="px-5 py-4">Prochaine séance</th>
                <th className="px-5 py-4 text-right">Publiée</th>
              </tr>
            </thead>
            <tbody>
              {activites.map((a) => {
                const c = COULEURS[CATEGORIES[a.categorie].couleur];
                const pct = Math.min(100, Math.round((a.inscrits / a.places) * 100));
                return (
                  <tr key={a.id} className={`border-b border-black/5 last:border-0 ${a.actif ? "" : "opacity-50"}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-2xl ${c.soft}`}>{a.emoji}</span>
                        <span>
                          <span className="block font-extrabold">{a.titre}</span>
                          <span className="text-xs text-brume">{CATEGORIES[a.categorie].label} · {a.age_min}–{a.age_max} ans · {a.lieu}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="block font-bold">{jourNom(a.jour)}</span>
                      <span className="text-xs text-brume">{heure(a.heure_debut)} – {heure(a.heure_fin)}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold">{a.inscrits}/{a.places} inscrits</span>
                      <div className="mt-1 h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${c.bg}`} style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ActionButton
                        action={basculerActivite.bind(null, a.id)}
                        title={a.actif ? "Masquer du programme" : "Publier"}
                        className={a.actif ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}
                      >
                        {a.actif ? <><Eye className="size-4" /> Visible</> : <><EyeOff className="size-4" /> Masquée</>}
                      </ActionButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Inscriptions à venir ({inscriptions.length})</h2>
          {inscriptions.length === 0 ? (
            <Vide emoji="🎈" texte="Aucune inscription pour le moment." />
          ) : (
            <ul className="grid gap-2">
              {inscriptions.map((i) => (
                <li key={i.id} className="card flex items-center gap-3 p-4">
                  <span className="text-2xl">{i.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold">{i.enfant_nom} <span className="font-bold text-brume">({i.age} an{i.age > 1 ? "s" : ""}{i.chambre ? ` · ch. ${i.chambre}` : ""})</span></span>
                    <span className="block truncate text-xs text-brume">
                      {i.activite_titre} · <span className="capitalize">{dateJour(i.date_seance)}</span> · {i.parent_nom} {i.telephone}
                    </span>
                  </span>
                  <ActionButton
                    action={supprimerInscription.bind(null, i.id)}
                    confirmer={`Annuler l'inscription de ${i.enfant_nom} ?`}
                    title="Annuler l'inscription"
                    className="bg-rose-50 text-rose-600"
                  >
                    <Trash2 className="size-4" />
                  </ActionButton>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
