"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";
import { m } from "@/components/ui/motion";
import { MedecinCard } from "./Cards";
import { pluriel } from "@/lib/format";
import { COULEURS } from "@/lib/theme";
import type { Medecin, Service } from "@/lib/types";

const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function MedecinsExplorer({ medecins, services }: { medecins: Medecin[]; services: Service[] }) {
  const [service, setService] = useState<number | null>(null);
  const [recherche, setRecherche] = useState("");
  const [dispoSeulement, setDispoSeulement] = useState(false);
  const q = useDeferredValue(recherche);

  const resultats = useMemo(() => {
    const nq = normalize(q.trim());
    return medecins.filter(
      (d) =>
        (service === null || d.service_id === service) &&
        (!dispoSeulement || d.disponible) &&
        (!nq || normalize(`${d.prenom} ${d.nom} ${d.specialite} ${d.service_nom} ${d.langues}`).includes(nq)),
    );
  }, [medecins, service, dispoSeulement, q]);

  return (
    <div>
      <div className="card flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search for a doctor</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-brume" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Name, specialty, language…"
              className="field pl-12"
              type="search"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-bord bg-creme px-4 py-2.5 text-sm font-medium select-none">
            <input
              type="checkbox"
              checked={dispoSeulement}
              onChange={(e) => setDispoSeulement(e.target.checked)}
              className="size-4 accent-azur"
            />
            Available only
          </label>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by department">
          {[{ id: null, nom: "All", couleur: null }, ...services].map((s) => {
            const actif = service === s.id;
            return (
              <button
                key={s.id ?? "tous"}
                type="button"
                onClick={() => setService(s.id)}
                aria-pressed={actif}
                className={`relative isolate rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  actif ? "border-transparent text-white" : "border-bord text-brume hover:border-azur hover:text-azur"
                }`}
              >
                {actif && (
                  <m.span
                    layoutId="filtre-service"
                    className={`absolute inset-0 -z-10 rounded-full ${s.couleur ? COULEURS[s.couleur].bg : "bg-azur"}`}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {s.nom}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-sm font-medium text-brume" aria-live="polite">
        {resultats.length} practitioner{pluriel(resultats.length)}
      </p>

      <m.div layout className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {resultats.map((d) => (
            <m.div
              key={d.id}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <MedecinCard medecin={d} />
            </m.div>
          ))}
        </AnimatePresence>
      </m.div>

      {resultats.length === 0 && (
        <div className="card mt-6 p-10 text-center">
          <p className="font-semibold">No practitioner matches your search.</p>
          <button
            type="button"
            onClick={() => {
              setRecherche("");
              setService(null);
              setDispoSeulement(false);
            }}
            className="btn btn-secondaire mt-4"
          >
            <X className="size-4" /> Reset
          </button>
        </div>
      )}
    </div>
  );
}
