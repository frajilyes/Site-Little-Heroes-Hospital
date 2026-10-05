import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { getActualites } from "@/lib/data";
import { supprimerActualite } from "@/app/actions/admin";
import { dateLongue } from "@/lib/format";
import { COULEURS } from "@/lib/theme";
import { AdminHeader, Vide } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/Toaster";
import { NouvelleActualite } from "@/components/admin/CreateForms";

export const metadata: Metadata = { title: "Actualités" };

export default async function AdminActualitesPage() {
  const actus = await getActualites();
  return (
    <>
      <AdminHeader titre="Actualités" sousTitre="Les articles publiés sur le site.">
        <NouvelleActualite />
      </AdminHeader>
      {actus.length === 0 ? (
        <Vide emoji="📰" texte="Aucune actualité publiée." />
      ) : (
        <ul className="grid gap-3">
          {actus.map((a) => (
            <li key={a.id} className="card flex items-center gap-4 p-4">
              <span className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-3xl ${COULEURS[a.couleur].grad}`}>{a.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-extrabold">{a.titre}</span>
                <span className="block truncate text-xs text-brume">{a.categorie} · {dateLongue(a.date_pub)}</span>
              </span>
              <Link href={`/actualites/${a.slug}`} target="_blank" className="grid size-9 place-items-center rounded-xl bg-creme hover:text-ciel" aria-label="Voir sur le site">
                <ExternalLink className="size-4" />
              </Link>
              <ActionButton action={supprimerActualite.bind(null, a.id)} confirmer={`Supprimer « ${a.titre} » ?`} title="Supprimer" className="bg-rose-50 text-rose-600">
                <Trash2 className="size-4" />
              </ActionButton>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
