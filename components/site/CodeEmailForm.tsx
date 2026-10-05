"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { MailCheck } from "lucide-react";
import { renvoyerCodeEmail } from "@/app/actions/public";
import { ETAT_INITIAL, Field, FormAlert, SubmitButton } from "@/components/ui/Form";
import type { FormState } from "@/lib/types";

const RESEND_DELAY_S = 60;

type Props = {
  jeton: string;
  email: string;
  /** Server Action qui vérifie le code (reçoit `jeton` et `code`). */
  confirmer: (prev: FormState, formData: FormData) => Promise<FormState>;
  onResult?: (state: FormState) => void;
  onRetour: () => void;
  retourLabel: string;
  children: ReactNode; // libellé du bouton de validation
};

/** Étape « Vérifiez votre boîte mail » : saisie du code à 6 chiffres, renvoi, retour. */
export function CodeEmailForm({ jeton, email, confirmer, onResult, onRetour, retourLabel, children }: Props) {
  const [state, action, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await confirmer(prev, formData);
    onResult?.(result);
    return result;
  }, ETAT_INITIAL);
  const [attente, setAttente] = useState(RESEND_DELAY_S);
  const [resendState, resendAction, resending] = useActionState(async () => {
    const result = await renvoyerCodeEmail(jeton);
    if (result.ok) setAttente(RESEND_DELAY_S);
    return result;
  }, ETAT_INITIAL);

  useEffect(() => {
    if (attente <= 0) return;
    const t = setTimeout(() => setAttente((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [attente]);

  return (
    <div className="grid animate-pop gap-4">
      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
        <MailCheck className="size-6 shrink-0 text-emerald-600" />
        <p>
          Un code à 6 chiffres vient d&apos;être envoyé à <strong>{email}</strong>. Pensez à vérifier vos courriers indésirables.
        </p>
      </div>
      <form action={action} className="grid gap-4">
        <input type="hidden" name="jeton" value={jeton} />
        <Field label="Code reçu par e-mail" name="code" error={state.errors?.code}>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            placeholder="123456"
            className="field max-w-xs text-center font-mono text-2xl tracking-[0.5em]"
            aria-invalid={state.errors?.code ? true : undefined}
            aria-describedby={state.errors?.code ? "code-error" : undefined}
            autoFocus
            required
          />
        </Field>
        <FormAlert state={state.ok ? ETAT_INITIAL : state} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={onRetour} className="text-sm font-extrabold text-brume hover:text-encre hover:underline">
            {retourLabel}
          </button>
          <SubmitButton pending={pending}>{children}</SubmitButton>
        </div>
      </form>
      <form action={resendAction} className="text-sm font-bold">
        <button type="submit" disabled={attente > 0 || resending} className="text-corail hover:underline disabled:text-brume disabled:no-underline">
          {resending ? "Envoi…" : attente > 0 ? `Vous n'avez rien reçu ? Renvoyer le code (${attente} s)` : "Vous n'avez rien reçu ? Renvoyer le code"}
        </button>
      </form>
      <FormAlert state={resendState} />
    </div>
  );
}
