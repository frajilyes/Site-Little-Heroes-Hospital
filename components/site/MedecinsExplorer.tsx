"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";
import { m } from "@/components/ui/motion";
import { MedecinCard } from "./Cards";
import { COULEURS } from "@/lib/theme";
import type { Medecin, Service } from "@/lib/types";

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

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
            <span className="sr-only">Rechercher un médecin</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-brume" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Nom, spécialité, langue…"
              className="field pl-12"
              type="search"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-creme px-4 py-3 text-sm font-bold select-none">
            <input
              type="checkbox"
              checked={dispoSeulement}
              onChange={(e) => setDispoSeulement(e.target.checked)}
              className="size-5 accent-emerald-500"
            />
            Disponibles uniquement
          </label>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par service">
          {[{ id: null, nom: "Tous", couleur: null }, ...services].map((s) => {
            const actif = service === s.id;
            return (
              <button
                key={s.id ?? "tous"}
                type="button"
                onClick={() => setService(s.id)}
                aria-pressed={actif}
                className={`relative isolate rounded-full px-4 py-2 text-sm font-bold transition-colors ${actif ? "text-white" : "text-brume hover:text-encre"}`}
              >
                {actif && (
                  <m.span
                    layoutId="filtre-service"
                    className={`absolute inset-0 -z-10 rounded-full ${s.couleur ? COULEURS[s.couleur].bg : "bg-encre"}`}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {s.nom}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-sm font-bold text-brume" aria-live="polite">
        {resultats.length} médecin{resultats.length > 1 ? "s" : ""}
      </p>

      <m.div layout className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <p className="text-4xl">🔍</p>
          <p className="mt-3 font-bold">Aucun médecin ne correspond à votre recherche.</p>
          <button
            type="button"
            onClick={() => {
              setRecherche("");
              setService(null);
              setDispoSeulement(false);
            }}
            className="btn mt-4 bg-creme text-encre"
          >
            <X className="size-4" /> Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}
