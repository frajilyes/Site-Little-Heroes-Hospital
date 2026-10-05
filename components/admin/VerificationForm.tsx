"use client";

import { useActionState, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { annulerConnexion, renvoyerCode, verifierCode } from "@/app/actions/admin";
import { ETAT_INITIAL, Field, FormAlert, SubmitButton } from "@/components/ui/Form";

const RESEND_DELAY_S = 60;

export function VerificationForm({ cooldown }: { cooldown: number }) {
  const [state, action, pending] = useActionState(verifierCode, ETAT_INITIAL);
  const [attente, setAttente] = useState(cooldown);
  const [resendState, resendAction, resending] = useActionState(async () => {
    const result = await renvoyerCode();
    // Après un renvoi réussi, on relance le compte à rebours
    if (result.ok) setAttente(RESEND_DELAY_S);
    return result;
  }, ETAT_INITIAL);

  useEffect(() => {
    if (attente <= 0) return;
    const t = setTimeout(() => setAttente((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [attente]);

  return (
    <div className="mt-6 grid gap-4">
      <form action={action} className="grid gap-4">
        <Field label="Saisissez le code" name="code" error={state.errors?.code?.trim() || undefined}>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            placeholder="123456"
            className="field text-center font-mono text-2xl tracking-[0.5em]"
            aria-invalid={state.errors?.code ? true : undefined}
            aria-describedby={state.errors?.code ? "code-error" : undefined}
            autoFocus
            required
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-brume">
          <input type="checkbox" name="confiance" className="size-4 accent-corail" />
          Ne plus me demander de code sur cet appareil (30 jours)
        </label>
        <FormAlert state={state} />
        <SubmitButton pending={pending} className="w-full">
          <ShieldCheck className="size-4" /> Valider
        </SubmitButton>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
        <form action={resendAction}>
          <button type="submit" disabled={attente > 0 || resending} className="text-corail hover:underline disabled:text-brume disabled:no-underline">
            {resending ? "Envoi…" : attente > 0 ? `Renvoyer le code (${attente} s)` : "Renvoyer le code"}
          </button>
        </form>
        <form action={annulerConnexion}>
          <button type="submit" className="text-brume hover:text-encre hover:underline">
            Utiliser un autre compte
          </button>
        </form>
      </div>
      <FormAlert state={resendState} />
    </div>
  );
}
