"use client";

import { useActionState, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { admettrePatient } from "@/app/actions/admin";
import { bind, ETAT_INITIAL, Field, FormAlert, Modal, SubmitButton } from "@/components/ui/Form";
import { toast } from "./Toaster";
import type { FormState } from "@/lib/types";

type Option = { id: number; nom: string };
type Medecin = Option & { service_id: number };

export function AdmissionButton({ services, medecins }: { services: Option[]; medecins: Medecin[] }) {
  const [ouvert, setOuvert] = useState(false);
  const [cle, setCle] = useState(0);
  return (
    <>
      <button type="button" onClick={() => { setCle((k) => k + 1); setOuvert(true); }} className="btn btn-primaire">
        <UserPlus className="size-4" /> New admission
      </button>
      <Modal open={ouvert} onClose={() => setOuvert(false)} title="New admission">
        <AdmissionForm key={cle} services={services} medecins={medecins} onDone={() => setOuvert(false)} />
      </Modal>
    </>
  );
}

function AdmissionForm({ services, medecins, onDone }: { services: Option[]; medecins: Medecin[]; onDone: () => void }) {
  const [state, action, pending] = useActionState(async (prev: FormState, fd: FormData) => {
    const res = await admettrePatient(prev, fd);
    if (res.ok) toast(res);
    return res;
  }, ETAT_INITIAL);
  // 0 when no department exists yet: a bare `services[0]?.id` is undefined, which flips the
  // select below from controlled to uncontrolled on the first keystroke.
  const [serviceId, setServiceId] = useState(Number(state.data?.service_id) || services[0]?.id || 0);

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="grid gap-4" noValidate>
      <h2 className="pr-10 text-2xl font-semibold">New admission</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="prenom" error={state.errors?.prenom}><input {...bind(state, "prenom")} className="field" /></Field>
        <Field label="Last name" name="nom" error={state.errors?.nom}><input {...bind(state, "nom")} className="field" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date of birth" name="date_naissance" error={state.errors?.date_naissance}><input {...bind(state, "date_naissance")} type="date" className="field" /></Field>
        <Field label="Sex" name="sexe" error={state.errors?.sexe}>
          <select {...bind(state, "sexe")} className="field"><option value="F">Girl</option><option value="M">Boy</option></select>
        </Field>
        <Field label="Blood type" name="groupe_sanguin" error={state.errors?.groupe_sanguin}>
          <select {...bind(state, "groupe_sanguin")} className="field">
            <option value="">Unknown</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Allergies" name="allergies" error={state.errors?.allergies}><input {...bind(state, "allergies")} className="field" placeholder="None" /></Field>
      {services.length === 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No department is registered yet, so a patient cannot be assigned to one. Add the
          hospital&rsquo;s departments before admitting anyone.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Department" name="service_id" error={state.errors?.service_id}>
          <select id="service_id" name="service_id" value={serviceId} onChange={(e) => setServiceId(Number(e.target.value))} className="field">
            {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
        </Field>
        <Field label="Attending doctor" name="medecin_id" error={state.errors?.medecin_id}>
          <select id="medecin_id" name="medecin_id" key={serviceId} className="field">
            <option value="">—</option>
            {medecins.filter((d) => d.service_id === serviceId).map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Room" name="chambre" error={state.errors?.chambre}><input {...bind(state, "chambre")} className="field" /></Field>
        <Field label="Status" name="statut" error={state.errors?.statut}>
          <select {...bind(state, "statut")} className="field"><option value="hospitalise">Hospitalized</option><option value="observation">Observation</option></select>
        </Field>
        <Field label="Expected discharge" name="date_sortie_prevue" error={state.errors?.date_sortie_prevue}><input {...bind(state, "date_sortie_prevue")} type="date" className="field" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Parent / guardian" name="parent_nom" error={state.errors?.parent_nom}><input {...bind(state, "parent_nom")} className="field" /></Field>
        <Field label="Phone" name="parent_tel" error={state.errors?.parent_tel}><input {...bind(state, "parent_tel")} type="tel" className="field" /></Field>
      </div>
      {!state.ok && <FormAlert state={state} />}
      <SubmitButton pending={pending} className="w-full">Admit patient</SubmitButton>
    </form>
  );
}
