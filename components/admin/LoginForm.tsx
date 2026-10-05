"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { login } from "@/app/actions/admin";
import { ETAT_INITIAL, Field, FormAlert, SubmitButton } from "@/components/ui/Form";

export function LoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState(login, ETAT_INITIAL);
  return (
    <form action={action} className="mt-8 grid gap-4">
      <input type="hidden" name="from" value={from} />
      <Field label="E-mail" name="email">
        <input id="email" name="email" type="email" defaultValue={state.data?.email ?? ""} className="field" autoComplete="username" required />
      </Field>
      <Field label="Mot de passe" name="password">
        <input id="password" name="password" type="password" className="field" autoComplete="current-password" required />
      </Field>
      <FormAlert state={state} />
      <SubmitButton pending={pending} className="w-full">
        <LogIn className="size-4" /> Se connecter
      </SubmitButton>
      <p className="rounded-2xl bg-creme p-3 text-center text-xs text-brume">
        Démo : <strong>admin@petitsheros.fr</strong> / <strong>Admin123!</strong>
        <br />
        Un code de vérification sera ensuite envoyé par e-mail.
      </p>
    </form>
  );
}
