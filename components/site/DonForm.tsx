"use client";

import { useActionState, useState } from "react";
import { Check, Heart } from "lucide-react";
import { faireDon } from "@/app/actions/public";
import { bind, ETAT_INITIAL, Field, FormAlert, SubmitButton } from "@/components/ui/Form";
import { m } from "@/components/ui/motion";
import { ServiceIcon } from "@/components/ui/Icon";
import { PROJETS_DONS } from "@/lib/theme";
import { euros } from "@/lib/format";

const MONTANTS = [10, 25, 50, 100];

export function DonForm() {
  const [state, action, pending] = useActionState(faireDon, ETAT_INITIAL);
  const [montant, setMontant] = useState(25);
  const [projet, setProjet] = useState("salle-jeux");

  if (state.ok) {
    return (
      <div className="card p-10 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-menthe/10 text-menthe">
          <Check className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-bold">Thank you for your support</h2>
        <p className="mt-2 text-sm leading-relaxed text-brume">
          Your donation pledge of <strong className="text-encre">{euros(Number(state.data?.montant ?? 0))}</strong>{" "}
          has been recorded.
        </p>
        <p className="mt-5 rounded-lg border border-bord bg-creme p-4 text-sm leading-relaxed text-brume">
          66% of your donation is deductible from income tax. A tax receipt will be sent to you
          by e-mail.
        </p>
      </div>
    );
  }

  // Concrete equivalence, to make the amount tangible
  const impact =
    montant >= 100
      ? "a full day of clown doctors across the departments"
      : montant >= 50
        ? "an art-therapy workshop for ten children"
        : montant >= 25
          ? "ten books for the departments' library"
          : "drawing supplies for a workshop";

  return (
    <form action={action} className="card grid gap-6 p-6 sm:p-8" noValidate>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Project supported</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {Object.entries(PROJETS_DONS).map(([id, p]) => {
            const actif = projet === id;
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  actif ? "border-azur bg-azur/5 ring-1 ring-azur" : "border-bord hover:border-azur"
                }`}
              >
                <input type="radio" name="projet" value={id} checked={actif} onChange={() => setProjet(id)} className="sr-only" />
                <ServiceIcon name={p.icone} className={`size-5 shrink-0 ${actif ? "text-azur" : "text-brume"}`} />
                <span className="text-sm font-semibold">{p.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Amount</legend>
        <div className="grid grid-cols-4 gap-2">
          {MONTANTS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setMontant(v)}
              className={`rounded-lg border py-2.5 font-display text-lg font-bold transition-colors ${
                montant === v ? "border-azur bg-azur text-white" : "border-bord bg-white hover:border-azur"
              }`}
            >
              {v} €
            </button>
          ))}
        </div>
        <label className="mt-3 flex items-center gap-3">
          <span className="text-sm text-brume">Other amount</span>
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
          <span className="font-semibold">€</span>
        </label>
        {state.errors?.montant && <p className="mt-1 text-xs font-medium text-corail">{state.errors.montant}</p>}
        <m.p
          key={impact}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-lg border border-bord bg-creme p-3 text-sm text-brume"
        >
          {euros(montant || 0)} can fund, for example, {impact}.
        </m.p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name (optional)" name="nom" error={state.errors?.nom}>
          <input {...bind(state, "nom")} className="field" autoComplete="name" />
        </Field>
        <Field label="E-mail (for the tax receipt)" name="email" error={state.errors?.email}>
          <input {...bind(state, "email")} type="email" className="field" autoComplete="email" />
        </Field>
      </div>
      <Field label="Message for the teams (optional)" name="message" error={state.errors?.message}>
        <textarea {...bind(state, "message")} rows={2} maxLength={500} className="field resize-none" />
      </Field>
      <FormAlert state={state} />
      <SubmitButton pending={pending} className="w-full py-3 text-base">
        <Heart className="size-5" /> Donate {euros(montant || 0)}
      </SubmitButton>
      <p className="-mt-2 text-center text-xs text-brume">
        Demo: no real payment is made, the donation pledge is recorded in the database.
      </p>
    </form>
  );
}
