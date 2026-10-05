"use client";

import { useActionState, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Clock, MapPin, User, Users } from "lucide-react";
import { m } from "@/components/ui/motion";
import { bind, Confetti, ETAT_INITIAL, Field, FormAlert, Modal, SubmitButton } from "@/components/ui/Form";
import { inscrireActivite } from "@/app/actions/public";
import { CATEGORIES, COULEURS } from "@/lib/theme";
import { dateLongue, heure, JOURS_SEMAINE } from "@/lib/format";
import type { Activite, CategorieActivite } from "@/lib/types";

export function ActivitesPlanner({ activites, jourInitial, aujourdhui }: { activites: Activite[]; jourInitial: number; aujourdhui: number }) {
  const [jour, setJour] = useState(jourInitial);
  const [categorie, setCategorie] = useState<CategorieActivite | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [selection, setSelection] = useState<Activite | null>(null);

  const parJour = useMemo(() => {
    const map = new Map<number, number>();
    activites.forEach((a) => map.set(a.jour, (map.get(a.jour) ?? 0) + 1));
    return map;
  }, [activites]);

  const liste = activites.filter(
    (a) =>
      a.jour === jour &&
      (categorie === null || a.categorie === categorie) &&
      (age === null || (age >= a.age_min && age <= a.age_max)),
  );

  const categoriesPresentes = [...new Set(activites.map((a) => a.categorie))];

  return (
    <div>
      {/* Jours */}
      <div className="card grid grid-cols-7 gap-1 p-2" role="tablist" aria-label="Jour de la semaine">
        {JOURS_SEMAINE.map((nom, i) => {
          const j = i + 1;
          const actif = j === jour;
          return (
            <button
              key={nom}
              role="tab"
              aria-selected={actif}
              onClick={() => setJour(j)}
              className={`relative isolate rounded-2xl px-1 py-3 text-center transition-colors ${actif ? "text-white" : "text-brume hover:bg-creme"}`}
            >
              {actif && (
                <m.span
                  layoutId="jour-actif"
                  className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-corail to-soleil shadow-lg"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="block font-display text-sm font-semibold sm:text-base">
                <span className="sm:hidden">{nom.slice(0, 3)}</span>
                <span className="hidden sm:inline">{nom}</span>
              </span>
              <span className={`text-[11px] font-bold ${actif ? "text-white/90" : ""}`}>
                {parJour.get(j) ?? 0} act.
              </span>
              {j === aujourdhui && (
                <span className={`absolute top-1.5 right-1.5 size-2 rounded-full ${actif ? "bg-white" : "bg-corail"}`} title="Aujourd'hui" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filtres */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Catégorie">
          <Chip actif={categorie === null} onClick={() => setCategorie(null)}>
            ✨ Toutes
          </Chip>
          {categoriesPresentes.map((c) => (
            <Chip key={c} actif={categorie === c} onClick={() => setCategorie(categorie === c ? null : c)}>
              {CATEGORIES[c].label}
            </Chip>
          ))}
        </div>
        <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2 text-sm font-bold shadow-sm">
          Âge de l&apos;enfant
          <select
            value={age ?? ""}
            onChange={(e) => setAge(e.target.value === "" ? null : Number(e.target.value))}
            className="rounded-xl bg-creme px-3 py-1.5 font-bold"
          >
            <option value="">Tous âges</option>
            {Array.from({ length: 19 }).map((_, i) => (
              <option key={i} value={i}>
                {i} an{i > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Liste */}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {liste.map((a, i) => (
            <ActiviteCard key={a.id} activite={a} index={i} onInscrire={() => setSelection(a)} />
          ))}
        </AnimatePresence>
      </div>
      {liste.length === 0 && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card mt-2 p-12 text-center">
          <p className="text-5xl">🦥</p>
          <p className="mt-3 font-display text-xl font-semibold">Aucune activité avec ces filtres</p>
          <p className="mt-1 text-brume">Essayez un autre jour ou une autre catégorie.</p>
        </m.div>
      )}

      <InscriptionModal activite={selection} onClose={() => setSelection(null)} />
    </div>
  );
}

function Chip({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
        actif ? "scale-105 bg-encre text-white shadow-md" : "bg-white text-brume shadow-sm hover:text-encre"
      }`}
    >
      {children}
    </button>
  );
}

function ActiviteCard({ activite: a, index, onInscrire }: { activite: Activite; index: number; onInscrire: () => void }) {
  const cat = CATEGORIES[a.categorie];
  const c = COULEURS[cat.couleur];
  const restantes = Math.max(0, a.places - a.inscrits);
  const pct = Math.min(100, Math.round((a.inscrits / a.places) * 100));

  return (
    <m.article
      id={`activite-${a.id}`}
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay: index * 0.05 }}
      className="group card flex scroll-mt-32 gap-5 p-5 sm:p-6"
    >
      <div className={`grid size-20 shrink-0 place-items-center rounded-3xl text-4xl ${c.soft} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
        {a.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${c.soft} ${c.text}`}>{cat.label}</span>
          <span className="rounded-full bg-creme px-2.5 py-0.5 text-[11px] font-extrabold text-brume">
            {a.age_min}–{a.age_max} ans
          </span>
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold">{a.titre}</h3>
        <p className="mt-1 text-sm text-brume">{a.description}</p>
        <ul className="mt-3 grid gap-1 text-xs font-bold text-brume sm:grid-cols-2">
          <li className="flex items-center gap-1.5"><Clock className="size-3.5" /> {heure(a.heure_debut)} – {heure(a.heure_fin)}</li>
          <li className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {a.lieu}</li>
          <li className="flex items-center gap-1.5 sm:col-span-2"><User className="size-3.5" /> {a.animateur}</li>
        </ul>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-[11px] font-extrabold text-brume">
              <span className="flex items-center gap-1"><Users className="size-3.5" /> {a.inscrits}/{a.places} inscrits</span>
              <span>{restantes > 0 ? `${restantes} place${restantes > 1 ? "s" : ""}` : "Complet"}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
              <m.div
                className={`h-full rounded-full ${c.bg}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onInscrire}
            disabled={restantes === 0}
            className={`btn shrink-0 px-4 py-2 text-sm ${restantes ? "bg-encre text-white" : "bg-slate-100 text-slate-400"}`}
          >
            {restantes ? "S'inscrire" : "Complet"}
          </button>
        </div>
      </div>
    </m.article>
  );
}

function InscriptionModal({ activite, onClose }: { activite: Activite | null; onClose: () => void }) {
  // Clé = activité : l'état du formulaire repart de zéro à chaque ouverture
  return (
    <Modal open={!!activite} onClose={onClose} title={activite ? `Inscription : ${activite.titre}` : "Inscription"}>
      {activite && <InscriptionForm key={activite.id} activite={activite} onClose={onClose} />}
    </Modal>
  );
}

function InscriptionForm({ activite, onClose }: { activite: Activite; onClose: () => void }) {
  const [state, action, pending] = useActionState(inscrireActivite, ETAT_INITIAL);
  if (state.ok) {
    return (
      <div className="py-6 text-center">
        <Confetti />
        <m.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200 }} className="text-7xl">
          {activite.emoji}
        </m.div>
        <h2 className="mt-4 text-2xl font-semibold">Inscription confirmée !</h2>
        <p className="mt-2 text-brume">{state.message}</p>
        {state.data?.date_seance && (
          <p className="mt-4 rounded-2xl bg-creme p-4 text-sm font-bold">
            Rendez-vous le {dateLongue(state.data.date_seance)} à {heure(activite.heure_debut)}
            <br />
            {activite.lieu}
          </p>
        )}
        <button type="button" onClick={onClose} className="btn mt-6 bg-encre text-white">
          Super, merci !
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4" noValidate>
      <div className="flex items-center gap-4 pr-10">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-creme text-4xl">{activite.emoji}</span>
        <div>
          <h2 className="text-xl font-semibold">{activite.titre}</h2>
          <p className="text-sm font-bold text-brume">
            {dateLongue(activite.prochaine_date)} · {heure(activite.heure_debut)}
          </p>
        </div>
      </div>
      <input type="hidden" name="activite_id" value={activite.id} />
      <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
        <Field label="Prénom de l'enfant" name="enfant_nom" error={state.errors?.enfant_nom}>
          <input {...bind(state, "enfant_nom")} className="field" autoComplete="off" required />
        </Field>
        <Field label="Âge" name="age" error={state.errors?.age}>
          <input {...bind(state, "age")} type="number" min={activite.age_min} max={activite.age_max} className="field" required />
        </Field>
      </div>
      <Field label="Chambre (si hospitalisé)" name="chambre" error={state.errors?.chambre}>
        <input {...bind(state, "chambre")} className="field" placeholder="ex : 204" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom du parent" name="parent_nom" error={state.errors?.parent_nom}>
          <input {...bind(state, "parent_nom")} className="field" autoComplete="name" required />
        </Field>
        <Field label="Téléphone" name="telephone" error={state.errors?.telephone}>
          <input {...bind(state, "telephone")} type="tel" className="field" autoComplete="tel" required />
        </Field>
      </div>
      <FormAlert state={state} />
      <SubmitButton pending={pending} className="w-full">Confirmer l&apos;inscription</SubmitButton>
    </form>
  );
}
