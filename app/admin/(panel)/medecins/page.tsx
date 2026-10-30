import type { Metadata } from "next";
import Image from "next/image";
import { getMedecins } from "@/lib/data";
import { basculerDisponibilite } from "@/app/actions/admin";
import { COULEURS } from "@/lib/theme";
import { portraitParDefaut, src } from "@/lib/images";
import { AdminHeader } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/Toaster";
import { Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = { title: "Doctors" };

export default async function AdminMedecinsPage() {
  const medecins = await getMedecins();
  const dispo = medecins.filter((d) => d.disponible).length;

  return (
    <>
      <AdminHeader
        titre="Doctors"
        sousTitre={
          medecins.length
            ? `${dispo} out of ${medecins.length} are accepting new appointments.`
            : "No doctors registered."
        }
      />
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" gap={0.04}>
        {medecins.map((d) => {
          const c = COULEURS[d.couleur];
          return (
            <StaggerItem key={d.id} className="card flex items-center gap-4 p-5">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-voile">
                <Image
                  src={src(d.photo, portraitParDefaut(d.id), 160)}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover object-top"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{d.titre} {d.prenom} {d.nom}</span>
                <span className="block truncate text-xs text-brume">{d.specialite}</span>
                <span className={`block truncate text-xs font-semibold ${c.text}`}>{d.service_nom}</span>
              </span>
              <ActionButton
                action={basculerDisponibilite.bind(null, d.id)}
                title={d.disponible ? "Mark unavailable" : "Mark available"}
                className={d.disponible ? "bg-emerald-100 text-emerald-800" : "bg-voile text-brume"}
              >
                {d.disponible ? "Available" : "Unavail."}
              </ActionButton>
            </StaggerItem>
          );
        })}
      </Stagger>
    </>
  );
}
