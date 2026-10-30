"use client";

import { useActionState, useState } from "react";
import { annulerRendezVous, demanderAnnulation } from "@/app/actions/public";
import { ETAT_INITIAL, FormAlert, SubmitButton } from "@/components/ui/Form";
import type { FormState } from "@/lib/types";
import { CodeEmailForm } from "./CodeEmailForm";

export function AnnulationForm({ reference, annulable }: { reference: string; annulable: boolean }) {
  const [ouvert, setOuvert] = useState(false);
  const [state, action, pending] = useActionState(demanderAnnulation, ETAT_INITIAL);
  const [jeton, setJeton] = useState<string | null>(null);
  const [fini, setFini] = useState<FormState | null>(null);

  const [dernierEtat, setDernierEtat] = useState(state);
  if (state !== dernierEtat) {
    setDernierEtat(state);
    if (state.ok && state.data?.jeton) setJeton(state.data.jeton);
  }

  if (fini) return <div className="border-t border-black/5 p-6"><FormAlert state={fini} /></div>;
  if (!annulable) return null;

  return (
    <div className="border-t border-black/5 p-6">
      {!ouvert ? (
        <button type="button" onClick={() => setOuvert(true)} className="text-sm font-bold text-corail hover:underline">
          Cancel this appointment
        </button>
      ) : jeton ? (
        <CodeEmailForm
          jeton={jeton}
          email={state.data?.email ?? ""}
          confirmer={annulerRendezVous}
          onResult={(r) => r.ok && setFini(r)}
          onRetour={() => setJeton(null)}
          retourLabel="← Change e-mail address"
        >
          Confirm cancellation
        </CodeEmailForm>
      ) : (
        <form action={action} className="grid animate-fade gap-3">
          <input type="hidden" name="reference" value={reference} />
          <label htmlFor="email-annul" className="text-sm font-bold">
            Enter the e-mail used for the booking: we&apos;ll send a confirmation code to it
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input id="email-annul" name="email" type="email" defaultValue={state.data?.email ?? ""} required className="field" autoComplete="email" />
            <SubmitButton pending={pending} className="shrink-0">Receive the code</SubmitButton>
          </div>
          <FormAlert state={state.ok ? ETAT_INITIAL : state} />
        </form>
      )}
    </div>
  );
}
