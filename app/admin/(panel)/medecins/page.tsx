import type { Metadata } from "next";
import { getMedecins } from "@/lib/data";
import { basculerDisponibilite } from "@/app/actions/admin";
import { COULEURS } from "@/lib/theme";
import { AdminHeader } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/Toaster";
import { Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = { title: "Médecins" };

export default async function AdminMedecinsPage() {
  const medecins = await getMedecins();
  const dispo = medecins.filter((d) => d.disponible).length;

  return (
    <>
      <AdminHeader titre="Médecins" sousTitre={`${dispo} sur ${medecins.length} acceptent de nouveaux rendez-vous.`} />
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" gap={0.04}>
        {medecins.map((d) => {
          const c = COULEURS[d.couleur];
          return (
            <StaggerItem key={d.id} className="card flex items-center gap-4 p-5">
              <span className={`grid size-14 shrink-0 place-items-center rounded-2xl text-3xl ${c.soft}`}>{d.avatar}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-extrabold">{d.titre} {d.prenom} {d.nom}</span>
                <span className="block truncate text-xs text-brume">{d.specialite}</span>
                <span className={`block truncate text-xs font-bold ${c.text}`}>{d.service_nom}</span>
              </span>
              <ActionButton
                action={basculerDisponibilite.bind(null, d.id)}
                title={d.disponible ? "Rendre indisponible" : "Rendre disponible"}
                className={d.disponible ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}
              >
                {d.disponible ? "Disponible" : "Indispo."}
              </ActionButton>
            </StaggerItem>
          );
        })}
      </Stagger>
    </>
  );
}
