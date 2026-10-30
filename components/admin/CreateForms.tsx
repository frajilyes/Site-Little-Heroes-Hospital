"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { creerActivite, publierActualite } from "@/app/actions/admin";
import { bind, ETAT_INITIAL, Field, FormAlert, Modal, SubmitButton } from "@/components/ui/Form";
import { CATEGORIES } from "@/lib/theme";
import { JOURS_SEMAINE } from "@/lib/format";
import { toast } from "./Toaster";
import type { FormState } from "@/lib/types";

type ServerAction = (prev: FormState, fd: FormData) => Promise<FormState>;

/** Button + modal whose form resets from scratch every time it opens. */
function ModalCreation({ label, titre, action, children }: { label: string; titre: string; action: ServerAction; children: (state: FormState) => ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const [cle, setCle] = useState(0);
  return (
    <>
      <button type="button" onClick={() => { setCle((k) => k + 1); setOuvert(true); }} className="btn btn-primaire">
        <Plus className="size-4" /> {label}
      </button>
      <Modal open={ouvert} onClose={() => setOuvert(false)} title={titre}>
        <FormulaireCreation key={cle} titre={titre} action={action} onDone={() => setOuvert(false)}>
          {children}
        </FormulaireCreation>
      </Modal>
    </>
  );
}

function FormulaireCreation({ titre, action, onDone, children }: { titre: string; action: ServerAction; onDone: () => void; children: (state: FormState) => ReactNode }) {
  const [state, formAction, pending] = useActionState(async (prev: FormState, fd: FormData) => {
    const res = await action(prev, fd);
    if (res.ok) toast(res);
    return res;
  }, ETAT_INITIAL);

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <h2 className="pr-10 text-xl font-bold">{titre}</h2>
      {children(state)}
      {!state.ok && <FormAlert state={state} />}
      <SubmitButton pending={pending} className="w-full">Save</SubmitButton>
    </form>
  );
}

export function NouvelleActivite() {
  return (
    <ModalCreation label="New activity" titre="New activity" action={creerActivite}>
      {(s) => (
        <>
          <div className="grid gap-4 sm:grid-cols-[1fr_90px]">
            <Field label="Title" name="titre" error={s.errors?.titre}><input {...bind(s, "titre")} className="field" /></Field>
            <Field label="Emoji" name="emoji" error={s.errors?.emoji}><input {...bind(s, "emoji")} className="field text-center text-xl" placeholder="🎨" /></Field>
          </div>
          <Field label="Description" name="description" error={s.errors?.description}>
            <textarea {...bind(s, "description")} rows={3} className="field resize-none" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" name="categorie" error={s.errors?.categorie}>
              <select {...bind(s, "categorie")} className="field">
                {Object.entries(CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Day" name="jour" error={s.errors?.jour}>
              <select {...bind(s, "jour")} className="field">
                {JOURS_SEMAINE.map((j, i) => <option key={j} value={i + 1}>{j}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Start" name="heure_debut" error={s.errors?.heure_debut}><input {...bind(s, "heure_debut")} type="time" className="field" /></Field>
            <Field label="End" name="heure_fin" error={s.errors?.heure_fin}><input {...bind(s, "heure_fin")} type="time" className="field" /></Field>
            <Field label="Min age" name="age_min" error={s.errors?.age_min}><input {...bind(s, "age_min")} type="number" min={0} max={18} className="field" /></Field>
            <Field label="Max age" name="age_max" error={s.errors?.age_max}><input {...bind(s, "age_max")} type="number" min={0} max={18} className="field" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_100px]">
            <Field label="Location" name="lieu" error={s.errors?.lieu}><input {...bind(s, "lieu")} className="field" /></Field>
            <Field label="Host" name="animateur" error={s.errors?.animateur}><input {...bind(s, "animateur")} className="field" /></Field>
            <Field label="Spots" name="places" error={s.errors?.places}><input {...bind(s, "places")} type="number" min={1} className="field" /></Field>
          </div>
        </>
      )}
    </ModalCreation>
  );
}

export function NouvelleActualite() {
  return (
    <ModalCreation label="Publish an article" titre="New article" action={publierActualite}>
      {(s) => (
        <>
          <Field label="Title" name="titre" error={s.errors?.titre}><input {...bind(s, "titre")} className="field" /></Field>
          <Field
            label="Illustration"
            name="image"
            error={s.errors?.image}
            hint="Image URL, local path (/img/…), or Unsplash id (photo-…). Leave empty for the default illustration."
          >
            <input {...bind(s, "image")} className="field" placeholder="photo-1587351021759-3e566b6af7cc" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" name="categorie" error={s.errors?.categorie}><input {...bind(s, "categorie")} className="field" placeholder="Hospital life" /></Field>
            <Field label="Color" name="couleur" error={s.errors?.couleur}>
              <select {...bind(s, "couleur")} className="field">
                {["rose", "sky", "amber", "violet", "emerald", "teal", "indigo", "red"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Summary" name="resume" error={s.errors?.resume}><textarea {...bind(s, "resume")} rows={2} className="field resize-none" /></Field>
          <Field label="Content" name="contenu" error={s.errors?.contenu} hint="Separate paragraphs with a blank line.">
            <textarea {...bind(s, "contenu")} rows={6} className="field" />
          </Field>
        </>
      )}
    </ModalCreation>
  );
}
