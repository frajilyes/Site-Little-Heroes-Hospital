import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { getActualites } from "@/lib/data";
import { supprimerActualite } from "@/app/actions/admin";
import { dateLongue } from "@/lib/format";
import { ACTUALITE_PAR_DEFAUT, src } from "@/lib/images";
import { AdminHeader, Vide } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/Toaster";
import { NouvelleActualite } from "@/components/admin/CreateForms";

export const metadata: Metadata = { title: "News" };

export default async function AdminActualitesPage() {
  const actus = await getActualites();
  return (
    <>
      <AdminHeader titre="News" sousTitre="Articles published on the site.">
        <NouvelleActualite />
      </AdminHeader>
      {actus.length === 0 ? (
        <Vide texte="No articles published." />
      ) : (
        <ul className="grid gap-3">
          {actus.map((a) => (
            <li key={a.id} className="card flex items-center gap-4 p-4">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-voile">
                <Image
                  src={src(a.image, ACTUALITE_PAR_DEFAUT, 160)}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{a.titre}</span>
                <span className="block truncate text-xs text-brume">{a.categorie} · {dateLongue(a.date_pub)}</span>
              </span>
              <Link href={`/actualites/${a.slug}`} target="_blank" className="grid size-9 place-items-center rounded-lg bg-voile text-brume hover:text-azur" aria-label="View on site">
                <ExternalLink className="size-4" />
              </Link>
              <ActionButton action={supprimerActualite.bind(null, a.id)} confirmer={`Delete "${a.titre}"?`} title="Delete" className="bg-rose-50 text-rose-600">
                <Trash2 className="size-4" />
              </ActionButton>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
