"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { inscription } from "@/app/actions/admin";
import { bind, ETAT_INITIAL, Field, FormAlert, SubmitButton } from "@/components/ui/Form";
import { MOT_DE_PASSE_MIN } from "@/lib/validation";

export function InscriptionForm() {
  const [state, action, pending] = useActionState(inscription, ETAT_INITIAL);
  return (
    <form action={action} className="mt-8 grid gap-4">
      <Field label="Full name" name="nom" error={state.errors?.nom}>
        <input {...bind(state, "nom")} type="text" className="field" autoComplete="name" maxLength={120} required />
      </Field>
      <Field label="E-mail" name="email" error={state.errors?.email} hint="The verification code is sent to this address.">
        <input {...bind(state, "email")} type="email" className="field" autoComplete="username" maxLength={160} required />
      </Field>
      <Field
        label="Password"
        name="password"
        error={state.errors?.password}
        hint={`${MOT_DE_PASSE_MIN} characters minimum.`}
      >
        <input
          id="password"
          name="password"
          type="password"
          className="field"
          autoComplete="new-password"
          minLength={MOT_DE_PASSE_MIN}
          maxLength={200}
          aria-invalid={state.errors?.password ? true : undefined}
          aria-describedby={state.errors?.password ? "password-error" : undefined}
          required
        />
      </Field>
      <Field label="Confirm password" name="confirmation" error={state.errors?.confirmation}>
        <input
          id="confirmation"
          name="confirmation"
          type="password"
          className="field"
          autoComplete="new-password"
          minLength={MOT_DE_PASSE_MIN}
          maxLength={200}
          aria-invalid={state.errors?.confirmation ? true : undefined}
          aria-describedby={state.errors?.confirmation ? "confirmation-error" : undefined}
          required
        />
      </Field>
      <FormAlert state={state} />
      <SubmitButton pending={pending} className="w-full">
        <UserPlus className="size-4" /> Create the account
      </SubmitButton>
    </form>
  );
}
