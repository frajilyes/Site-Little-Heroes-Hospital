import Link from "next/link";
import type { ReactNode } from "react";

export function AdminHeader({ titre, sousTitre, children }: { titre: string; sousTitre?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="animate-rise text-3xl font-semibold sm:text-4xl">{titre}</h1>
        {sousTitre && <p className="mt-1 text-brume">{sousTitre}</p>}
      </div>
      {children}
    </div>
  );
}

/** Onglets de filtre basés sur l'URL (fonctionnent sans JavaScript). */
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
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${on ? "bg-encre text-white shadow-md" : "bg-white text-brume hover:text-encre"}`}
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
      <label htmlFor="q" className="sr-only">Rechercher</label>
      <input id="q" name="q" defaultValue={defaut} placeholder={placeholder} className="field min-w-0 py-2" type="search" />
      <button className="btn shrink-0 bg-encre px-4 py-2 text-sm text-white">OK</button>
    </form>
  );
}

export function Vide({ emoji, texte }: { emoji: string; texte: string }) {
  return (
    <div className="card p-12 text-center">
      <p className="text-5xl">{emoji}</p>
      <p className="mt-3 font-bold text-brume">{texte}</p>
    </div>
  );
}
