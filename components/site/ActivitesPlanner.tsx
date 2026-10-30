"use client";

import { useActionState, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Clock, MapPin, User, Users } from "lucide-react";
import { m } from "@/components/ui/motion";
import { bind, Confetti, ETAT_INITIAL, Field, FormAlert, Modal, SubmitButton } from "@/components/ui/Form";
import { inscrireActivite } from "@/app/actions/public";
import { CATEGORIES, COULEURS } from "@/lib/theme";
import { dateLongue, heure, JOURS_SEMAINE, pluriel } from "@/lib/format";
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
      {/* Days */}
      <div className="card grid grid-cols-7 gap-1 p-2" role="tablist" aria-label="Day of the week">
        {JOURS_SEMAINE.map((nom, i) => {
          const j = i + 1;
          const actif = j === jour;
          return (
            <button
              key={nom}
              role="tab"
              aria-selected={actif}
              onClick={() => setJour(j)}
              className={`relative isolate rounded-lg px-1 py-2.5 text-center transition-colors ${actif ? "text-white" : "text-brume hover:bg-voile"}`}
            >
              {actif && (
                <m.span
                  layoutId="jour-actif"
                  className="absolute inset-0 -z-10 rounded-lg bg-azur"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="block font-display text-sm font-bold">
                <span className="sm:hidden">{nom.slice(0, 3)}</span>
                <span className="hidden sm:inline">{nom}</span>
              </span>
              <span className={`text-[11px] font-medium ${actif ? "text-white/85" : ""}`}>
                {parJour.get(j) ?? 0} act.
              </span>
              {j === aujourdhui && (
                <span className={`absolute top-1.5 right-1.5 size-1.5 rounded-full ${actif ? "bg-white" : "bg-azur"}`} title="Today" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
          <Chip actif={categorie === null} onClick={() => setCategorie(null)}>
            All
          </Chip>
          {categoriesPresentes.map((c) => (
            <Chip key={c} actif={categorie === c} onClick={() => setCategorie(categorie === c ? null : c)}>
              {CATEGORIES[c].label}
            </Chip>
          ))}
        </div>
        <label className="flex items-center gap-3 rounded-lg border border-bord bg-white px-4 py-2 text-sm font-medium">
          Child&apos;s age
          <select
            value={age ?? ""}
            onChange={(e) => setAge(e.target.value === "" ? null : Number(e.target.value))}
            className="rounded-md bg-voile px-2.5 py-1.5 font-semibold"
          >
            <option value="">All ages</option>
            {Array.from({ length: 19 }).map((_, i) => (
              <option key={i} value={i}>
                {i} year{pluriel(i)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* List */}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {liste.map((a, i) => (
            <ActiviteCard key={a.id} activite={a} index={i} onInscrire={() => setSelection(a)} />
          ))}
        </AnimatePresence>
      </div>
      {liste.length === 0 && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card mt-2 p-12 text-center">
          <p className="font-display text-lg font-bold">No activity matches these filters</p>
          <p className="mt-1.5 text-sm text-brume">Try another day or another category.</p>
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
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        actif ? "border-azur bg-azur text-white" : "border-bord bg-white text-brume hover:border-azur hover:text-azur"
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
  // `places` is guarded to 1..500 on the way in, but a row edited straight in the
  // database can hold 0, and 0/0 makes the progress bar width NaN.
  const pct = a.places > 0 ? Math.min(100, Math.round((a.inscrits / a.places) * 100)) : 0;

  return (
    <m.article
      id={`activite-${a.id}`}
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay: index * 0.05 }}
      className="group card flex scroll-mt-32 gap-4 p-5 sm:p-6"
    >
      <div className={`grid size-16 shrink-0 place-items-center rounded-xl text-3xl ${c.soft}`}>
        {a.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${c.soft} ${c.text}`}>{cat.label}</span>
          <span className="rounded-md bg-voile px-2 py-0.5 text-[11px] font-bold text-brume">
            {a.age_min}–{a.age_max} yrs
          </span>
        </div>
        <h3 className="mt-2 font-display text-lg font-bold">{a.titre}</h3>
        <p className="mt-1 text-sm leading-relaxed text-brume">{a.description}</p>
        <ul className="mt-3 grid gap-1 text-xs font-medium text-brume sm:grid-cols-2">
          <li className="flex items-center gap-1.5"><Clock className="size-3.5" /> {heure(a.heure_debut)} – {heure(a.heure_fin)}</li>
          <li className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {a.lieu}</li>
          <li className="flex items-center gap-1.5 sm:col-span-2"><User className="size-3.5" /> {a.animateur}</li>
        </ul>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-[11px] font-semibold text-brume">
              <span className="flex items-center gap-1"><Users className="size-3.5" /> {a.inscrits}/{a.places} registered</span>
              <span>{restantes > 0 ? `${restantes} spot${pluriel(restantes)}` : "Full"}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-voile">
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
            className={`btn shrink-0 px-4 py-2 text-sm ${restantes ? "btn-primaire" : "bg-voile text-brume"}`}
          >
            {restantes ? "Sign up" : "Full"}
          </button>
        </div>
      </div>
    </m.article>
  );
}

function InscriptionModal({ activite, onClose }: { activite: Activite | null; onClose: () => void }) {
  // Key = activity: the form state resets from scratch each time it opens
  return (
    <Modal open={!!activite} onClose={onClose} title={activite ? `Sign up: ${activite.titre}` : "Sign up"}>
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
        <h2 className="mt-4 text-xl font-bold">Registration confirmed</h2>
        <p className="mt-2 text-sm text-brume">{state.message}</p>
        {state.data?.date_seance && (
          <p className="mt-4 rounded-lg border border-bord bg-creme p-4 text-sm font-medium">
            Appointment on {dateLongue(state.data.date_seance)} at {heure(activite.heure_debut)}
            <br />
            {activite.lieu}
          </p>
        )}
        <button type="button" onClick={onClose} className="btn btn-primaire mt-6">
          Close
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4" noValidate>
      <div className="flex items-center gap-4 pr-10">
        <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-voile text-3xl">{activite.emoji}</span>
        <div>
          <h2 className="text-lg font-bold">{activite.titre}</h2>
          <p className="text-sm text-brume">
            {dateLongue(activite.prochaine_date)} · {heure(activite.heure_debut)}
          </p>
        </div>
      </div>
      <input type="hidden" name="activite_id" value={activite.id} />
      <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
        <Field label="Child's first name" name="enfant_nom" error={state.errors?.enfant_nom}>
          <input {...bind(state, "enfant_nom")} className="field" autoComplete="off" required />
        </Field>
        <Field label="Age" name="age" error={state.errors?.age}>
          <input {...bind(state, "age")} type="number" min={activite.age_min} max={activite.age_max} className="field" required />
        </Field>
      </div>
      <Field label="Room (if hospitalized)" name="chambre" error={state.errors?.chambre}>
        <input {...bind(state, "chambre")} className="field" placeholder="e.g. 204" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Parent's name" name="parent_nom" error={state.errors?.parent_nom}>
          <input {...bind(state, "parent_nom")} className="field" autoComplete="name" required />
        </Field>
        <Field label="Phone" name="telephone" error={state.errors?.telephone}>
          <input {...bind(state, "telephone")} type="tel" className="field" autoComplete="tel" required />
        </Field>
      </div>
      <FormAlert state={state} />
      <SubmitButton pending={pending} className="w-full">Confirm sign-up</SubmitButton>
    </form>
  );
}
