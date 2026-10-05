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
      <button type="button" onClick={() => { setCle((k) => k + 1); setOuvert(true); }} className="btn bg-corail text-white shadow-lg shadow-corail/30">
        <UserPlus className="size-4" /> Nouvelle admission
      </button>
      <Modal open={ouvert} onClose={() => setOuvert(false)} title="Nouvelle admission">
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
  const [serviceId, setServiceId] = useState(Number(state.data?.service_id) || services[0]?.id);

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="grid gap-4" noValidate>
      <h2 className="pr-10 text-2xl font-semibold">Nouvelle admission</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom" name="prenom" error={state.errors?.prenom}><input {...bind(state, "prenom")} className="field" /></Field>
        <Field label="Nom" name="nom" error={state.errors?.nom}><input {...bind(state, "nom")} className="field" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Naissance" name="date_naissance" error={state.errors?.date_naissance}><input {...bind(state, "date_naissance")} type="date" className="field" /></Field>
        <Field label="Sexe" name="sexe" error={state.errors?.sexe}>
          <select {...bind(state, "sexe")} className="field"><option value="F">Fille</option><option value="M">Garçon</option></select>
        </Field>
        <Field label="Groupe sanguin" name="groupe_sanguin" error={state.errors?.groupe_sanguin}>
          <select {...bind(state, "groupe_sanguin")} className="field">
            <option value="">Inconnu</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Allergies" name="allergies" error={state.errors?.allergies}><input {...bind(state, "allergies")} className="field" placeholder="Aucune" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Service" name="service_id" error={state.errors?.service_id}>
          <select id="service_id" name="service_id" value={serviceId} onChange={(e) => setServiceId(Number(e.target.value))} className="field">
            {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
        </Field>
        <Field label="Médecin référent" name="medecin_id" error={state.errors?.medecin_id}>
          <select id="medecin_id" name="medecin_id" key={serviceId} className="field">
            <option value="">—</option>
            {medecins.filter((d) => d.service_id === serviceId).map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Chambre" name="chambre" error={state.errors?.chambre}><input {...bind(state, "chambre")} className="field" /></Field>
        <Field label="Statut" name="statut" error={state.errors?.statut}>
          <select {...bind(state, "statut")} className="field"><option value="hospitalise">Hospitalisé</option><option value="observation">Observation</option></select>
        </Field>
        <Field label="Sortie prévue" name="date_sortie_prevue" error={state.errors?.date_sortie_prevue}><input {...bind(state, "date_sortie_prevue")} type="date" className="field" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Parent / tuteur" name="parent_nom" error={state.errors?.parent_nom}><input {...bind(state, "parent_nom")} className="field" /></Field>
        <Field label="Téléphone" name="parent_tel" error={state.errors?.parent_tel}><input {...bind(state, "parent_tel")} type="tel" className="field" /></Field>
      </div>
      {!state.ok && <FormAlert state={state} />}
      <SubmitButton pending={pending} className="w-full">Admettre le patient</SubmitButton>
    </form>
  );
}
