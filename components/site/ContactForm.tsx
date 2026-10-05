"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { envoyerMessage } from "@/app/actions/public";
import { bind, ETAT_INITIAL, Field, FormAlert, SubmitButton } from "@/components/ui/Form";
import { m } from "@/components/ui/motion";

export function ContactForm() {
  const [state, action, pending] = useActionState(envoyerMessage, ETAT_INITIAL);

  if (state.ok) {
    return (
      <div className="card grid place-items-center p-12 text-center">
        <m.div initial={{ x: -80, y: 40, rotate: -20, opacity: 0 }} animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120 }} className="text-7xl">
          🕊️
        </m.div>
        <h2 className="mt-4 text-2xl font-semibold">Message bien reçu !</h2>
        <p className="mt-2 text-brume">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="card grid gap-4 p-6 sm:p-8" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Votre nom" name="nom" error={state.errors?.nom}>
          <input {...bind(state, "nom")} className="field" autoComplete="name" required />
        </Field>
        <Field label="E-mail" name="email" error={state.errors?.email}>
          <input {...bind(state, "email")} type="email" className="field" autoComplete="email" required />
        </Field>
      </div>
      <Field label="Sujet" name="sujet" error={state.errors?.sujet}>
        <input {...bind(state, "sujet")} className="field" list="sujets" required />
        <datalist id="sujets">
          <option value="Horaires de visite" />
          <option value="Bénévolat" />
          <option value="Dossier médical" />
          <option value="Remerciements" />
        </datalist>
      </Field>
      <Field label="Message" name="message" error={state.errors?.message}>
        <textarea {...bind(state, "message")} rows={6} maxLength={3000} className="field resize-y" required />
      </Field>
      <FormAlert state={state} />
      <SubmitButton pending={pending} className="justify-self-start">
        <Send className="size-4" /> Envoyer le message
      </SubmitButton>
    </form>
  );
}
