"use client";

import { useActionState, useState } from "react";
import { Heart } from "lucide-react";
import { faireDon } from "@/app/actions/public";
import { bind, Confetti, ETAT_INITIAL, Field, FormAlert, SubmitButton } from "@/components/ui/Form";
import { m } from "@/components/ui/motion";
import { COULEURS, PROJETS_DONS } from "@/lib/theme";
import { euros } from "@/lib/format";

const MONTANTS = [10, 25, 50, 100];

export function DonForm() {
  const [state, action, pending] = useActionState(faireDon, ETAT_INITIAL);
  const [montant, setMontant] = useState(25);
  const [projet, setProjet] = useState("salle-jeux");

  if (state.ok) {
    return (
      <div className="card p-10 text-center">
        <Confetti />
        <m.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-7xl">
          💛
        </m.div>
        <h2 className="mt-4 text-3xl font-semibold">Merci du fond du cœur !</h2>
        <p className="mt-2 text-brume">
          Votre promesse de don de <strong>{euros(Number(state.data?.montant ?? 0))}</strong> a bien été enregistrée.
        </p>
        <p className="mt-4 rounded-2xl bg-creme p-4 text-sm text-brume">
          66 % de votre don est déductible de vos impôts. Un reçu fiscal vous sera envoyé par e-mail.
        </p>
      </div>
    );
  }

  // Une impulsion = 50 € ≈ un atelier d'art-thérapie
  const impact = montant >= 100 ? "une journée de docteurs clowns 🤡" : montant >= 50 ? "un atelier d'art-thérapie 🎨" : montant >= 25 ? "10 livres pour la bibliothèque 📚" : "une boîte de feutres et de gommettes ✏️";

  return (
    <form action={action} className="card grid gap-6 p-6 sm:p-8" noValidate>
      <fieldset>
        <legend className="mb-3 text-sm font-extrabold">Je soutiens…</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(PROJETS_DONS).map(([id, p]) => {
            const actif = projet === id;
            const c = COULEURS[p.couleur];
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition-all ${actif ? `border-transparent ${c.soft} ring-4 ${c.ring}` : "border-[#f1ebe2] hover:border-transparent hover:shadow-md"}`}
              >
                <input type="radio" name="projet" value={id} checked={actif} onChange={() => setProjet(id)} className="sr-only" />
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-sm font-extrabold">{p.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-extrabold">Montant</legend>
        <div className="grid grid-cols-4 gap-2">
          {MONTANTS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setMontant(v)}
              className={`rounded-2xl py-3 font-display text-xl font-semibold transition-all ${montant === v ? "scale-105 bg-corail text-white shadow-lg shadow-corail/30" : "bg-creme hover:bg-rose-100"}`}
            >
              {v} €
            </button>
          ))}
        </div>
        <label className="mt-3 flex items-center gap-3">
          <span className="text-sm font-bold text-brume">Autre montant</span>
          <input
            name="montant"
            type="number"
            min={5}
            max={100000}
            value={montant}
            onChange={(e) => setMontant(Number(e.target.value))}
            className="field max-w-36"
            aria-invalid={state.errors?.montant ? true : undefined}
          />
          <span className="font-bold">€</span>
        </label>
        {state.errors?.montant && <p className="mt-1 text-xs font-bold text-corail">{state.errors.montant}</p>}
        <m.p key={impact} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
          ✨ {euros(montant || 0)}, c&apos;est par exemple {impact}
        </m.p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom (facultatif)" name="nom" error={state.errors?.nom}>
          <input {...bind(state, "nom")} className="field" autoComplete="name" />
        </Field>
        <Field label="E-mail (pour le reçu)" name="email" error={state.errors?.email}>
          <input {...bind(state, "email")} type="email" className="field" autoComplete="email" />
        </Field>
      </div>
      <Field label="Un petit mot pour les enfants ? (facultatif)" name="message" error={state.errors?.message}>
        <textarea {...bind(state, "message")} rows={2} maxLength={500} className="field resize-none" />
      </Field>
      <FormAlert state={state} />
      <SubmitButton pending={pending} className="w-full py-4 text-base">
        <Heart className="size-5 fill-white" /> Je donne {euros(montant || 0)}
      </SubmitButton>
      <p className="-mt-2 text-center text-xs text-brume">Démonstration : aucun paiement réel n&apos;est effectué, la promesse de don est enregistrée en base.</p>
    </form>
  );
}
