"use client";

import { useActionState } from "react";
import { Check, Send } from "lucide-react";
import { envoyerMessage } from "@/app/actions/public";
import { bind, ETAT_INITIAL, Field, FormAlert, SubmitButton } from "@/components/ui/Form";
import { m } from "@/components/ui/motion";

export function ContactForm() {
  const [state, action, pending] = useActionState(envoyerMessage, ETAT_INITIAL);

  if (state.ok) {
    return (
      <div className="card grid place-items-center p-12 text-center">
        <m.span
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="grid size-14 place-items-center rounded-full bg-menthe/10 text-menthe"
        >
          <Check className="size-7" />
        </m.span>
        <h2 className="mt-5 text-xl font-bold">Message received</h2>
        <p className="mt-2 text-sm text-brume">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="card grid gap-4 p-6 sm:p-8" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="nom" error={state.errors?.nom}>
          <input {...bind(state, "nom")} className="field" autoComplete="name" required />
        </Field>
        <Field label="E-mail" name="email" error={state.errors?.email}>
          <input {...bind(state, "email")} type="email" className="field" autoComplete="email" required />
        </Field>
      </div>
      <Field label="Subject" name="sujet" error={state.errors?.sujet}>
        <input {...bind(state, "sujet")} className="field" list="sujets" required />
        <datalist id="sujets">
          <option value="Visiting hours" />
          <option value="Volunteering" />
          <option value="Medical record" />
          <option value="Thank you" />
        </datalist>
      </Field>
      <Field label="Message" name="message" error={state.errors?.message}>
        <textarea {...bind(state, "message")} rows={6} maxLength={3000} className="field resize-y" required />
      </Field>
      <FormAlert state={state} />
      <SubmitButton pending={pending} className="justify-self-start">
        <Send className="size-4" /> Send message
      </SubmitButton>
    </form>
  );
}
