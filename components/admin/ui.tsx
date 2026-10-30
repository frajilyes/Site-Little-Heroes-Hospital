import Link from "next/link";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function AdminHeader({ titre, sousTitre, children }: { titre: string; sousTitre?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-bord pb-6">
      <div>
        <h1 className="animate-rise text-2xl font-bold sm:text-3xl">{titre}</h1>
        {sousTitre && <p className="mt-1 text-sm text-brume">{sousTitre}</p>}
      </div>
      {children}
    </div>
  );
}

/** URL-based filter tabs (work without JavaScript). */
export function FiltreOnglets({ base, courant, options, extra = {} }: { base: string; courant: string; options: [string, string, number?][]; extra?: Record<string, string> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([val, label, n]) => {
        const params = new URLSearchParams({ ...extra, statut: val });
        const on = courant === val;
        return (
          <Link
            key={val}
            href={`${base}?${params}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              on ? "border-azur bg-azur text-white" : "border-bord bg-white text-brume hover:border-azur hover:text-azur"
            }`}
          >
            {label}
            {n !== undefined && <span className={`ml-1.5 ${on ? "text-white/70" : "text-brume/70"}`}>{n}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function Recherche({ defaut, statut, placeholder }: { defaut: string; statut: string; placeholder: string }) {
  return (
    <form className="flex gap-2" role="search">
      <input type="hidden" name="statut" value={statut} />
      <label htmlFor="q" className="sr-only">Search</label>
      <input id="q" name="q" defaultValue={defaut} placeholder={placeholder} className="field min-w-0 py-2" type="search" />
      <button className="btn btn-primaire shrink-0 px-4 py-2 text-sm">Search</button>
    </form>
  );
}

export function Vide({ texte }: { texte: string }) {
  return (
    <div className="card p-12 text-center">
      <Inbox className="mx-auto size-7 text-brume/60" />
      <p className="mt-3 text-sm text-brume">{texte}</p>
    </div>
  );
}
