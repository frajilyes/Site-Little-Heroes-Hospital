import type { Metadata } from "next";
import { Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { getMessages } from "@/lib/data";
import { marquerMessage, supprimerMessage } from "@/app/actions/admin";
import { ilYA } from "@/lib/format";
import { AdminHeader, Vide } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/Toaster";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const messages = await getMessages();
  const nonLus = messages.filter((m) => !m.lu).length;

  return (
    <>
      <AdminHeader titre="Messages" sousTitre={nonLus ? `${nonLus} message${nonLus > 1 ? "s" : ""} non lu${nonLus > 1 ? "s" : ""}` : "Tout est lu."} />
      {messages.length === 0 ? (
        <Vide emoji="📭" texte="Aucun message." />
      ) : (
        <ul className="grid gap-3">
          {messages.map((x) => (
            <li key={x.id} className={`card p-5 transition-all ${x.lu ? "opacity-75" : "border-l-4 border-corail"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-display text-lg font-semibold">
                    {!x.lu && <span className="size-2.5 rounded-full bg-corail" aria-label="Non lu" />}
                    {x.sujet}
                  </p>
                  <p className="text-sm text-brume">
                    <strong className="text-encre">{x.nom}</strong> · {x.email} · {ilYA(x.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a href={`mailto:${x.email}?subject=${encodeURIComponent("Re : " + x.sujet)}`} className="inline-flex items-center gap-1.5 rounded-xl bg-sky-100 px-3 py-2 text-xs font-extrabold text-sky-800 transition-transform hover:-translate-y-0.5">
                    <Reply className="size-4" /> Répondre
                  </a>
                  <ActionButton action={marquerMessage.bind(null, x.id, !x.lu)} title={x.lu ? "Marquer non lu" : "Marquer lu"} className="bg-creme text-encre">
                    {x.lu ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                  </ActionButton>
                  <ActionButton action={supprimerMessage.bind(null, x.id)} confirmer="Supprimer ce message ?" title="Supprimer" className="bg-rose-50 text-rose-600">
                    <Trash2 className="size-4" />
                  </ActionButton>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-encre/90">{x.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
