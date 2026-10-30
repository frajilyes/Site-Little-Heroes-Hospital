"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, Copy } from "lucide-react";
import { m } from "@/components/ui/motion";
import { ServiceIcon } from "@/components/ui/Icon";
import { bind, ETAT_INITIAL, Field, FormAlert, SubmitButton } from "@/components/ui/Form";
import { confirmerRendezVous, prendreRendezVous } from "@/app/actions/public";
import { CodeEmailForm } from "./CodeEmailForm";
import { CRENEAUX } from "@/lib/constants";
import { COULEURS } from "@/lib/theme";
import { portraitParDefaut, src } from "@/lib/images";
import { dateLongue, heure as fmtHeure, parseDate, pluriel, toISODate } from "@/lib/format";
import type { FormState, Medecin, Service } from "@/lib/types";

const ETAPES = ["Department", "Doctor", "Time slot", "Your info"];

/** Next business days (starting tomorrow). */
function joursOuvres(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(toISODate(d));
  }
  return out;
}

type Props = {
  services: Service[];
  medecins: Medecin[];
  serviceInitial: number | null;
  medecinInitial: number | null;
};

export function RdvWizard({ services, medecins, serviceInitial, medecinInitial }: Props) {
  const medecinValide = medecins.find((d) => d.id === medecinInitial && d.disponible);
  const [serviceId, setServiceId] = useState<number | null>(medecinValide?.service_id ?? serviceInitial);
  const [medecinId, setMedecinId] = useState<number | null>(medecinValide?.id ?? null);
  const [date, setDate] = useState<string | null>(null);
  const [heure, setHeure] = useState<string | null>(null);
  const [etape, setEtape] = useState(medecinValide ? 2 : serviceInitial ? 1 : 0);
  const [direction, setDirection] = useState(1);
  const [state, action, pending] = useActionState(prendreRendezVous, ETAT_INITIAL);

  const service = services.find((s) => s.id === serviceId);
  const medecin = medecins.find((d) => d.id === medecinId);
  const medecinsDuService = medecins.filter((d) => d.service_id === serviceId);
  const jours = useMemo(() => joursOuvres(15), []);

  // Token for the request pending the e-mailed code, then the reference of the confirmed appointment
  const [jeton, setJeton] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [alerteCreneau, setAlerteCreneau] = useState<string | null>(null);

  const aller = (n: number) => {
    setDirection(n > etape ? 1 : -1);
    setEtape(n);
    // Going back to the time slot step discards the code already sent
    if (n < 3) setJeton(null);
  };

  // If the slot was taken in the meantime, send the user back to the time slot step
  const retourCreneau = (s: FormState) => {
    setAlerteCreneau(s.message);
    setJeton(null);
    setHeure(null);
    setDirection(-1);
    setEtape(2);
  };

  const [dernierEtat, setDernierEtat] = useState(state);
  if (state !== dernierEtat) {
    setDernierEtat(state);
    if (state.ok && state.data?.jeton) setJeton(state.data.jeton);
    if (state.errors?.heure || state.errors?.date_rdv) retourCreneau(state);
  }

  const resultatCode = (s: FormState) => {
    if (s.ok && s.data?.reference) setReference(s.data.reference);
    else if (s.errors?.heure) retourCreneau(s);
  };

  if (reference) {
    return <Confirmation reference={reference} service={service} medecin={medecin} date={date!} heure={heure!} />;
  }

  return (
    <div className="card overflow-hidden">
      {/* Progress */}
      <div className="border-b border-black/5 bg-white p-5 sm:p-6">
        <ol className="flex items-center gap-2">
          {ETAPES.map((nom, i) => {
            const fait = i < etape;
            const actif = i === etape;
            return (
              <li key={nom} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  disabled={i > etape}
                  onClick={() => aller(i)}
                  className="flex items-center gap-2 text-left disabled:cursor-default"
                  aria-current={actif ? "step" : undefined}
                >
                  <m.span
                    animate={{ backgroundColor: fait ? "#0d8f7f" : actif ? "#1668b3" : "#eef3f8" }}
                    className={`grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold ${fait || actif ? "text-white" : "text-brume"}`}
                  >
                    {fait ? <Check className="size-4" /> : i + 1}
                  </m.span>
                  <span className={`hidden text-sm font-semibold md:block ${actif ? "text-encre" : "text-brume"}`}>{nom}</span>
                </button>
                {i < ETAPES.length - 1 && (
                  <span className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-voile">
                    <m.span className="absolute inset-y-0 left-0 rounded-full bg-menthe" animate={{ width: fait ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="relative min-h-[420px] overflow-hidden p-5 sm:p-8">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <m.div
            key={etape}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {etape === 0 && (
              <>
                <h2 className="text-xl font-bold">Which department?</h2>
                {services.length === 0 && (
                  <p className="mt-6 rounded-lg border border-bord bg-creme p-5 text-sm text-brume">
                    No department is yet open for online appointment booking. Please contact
                    the hospital to arrange a consultation.
                  </p>
                )}
                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {services.map((s) => {
                    const c = COULEURS[s.couleur];
                    const choisi = s.id === serviceId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          if (s.id !== serviceId) {
                            setMedecinId(null);
                            setHeure(null);
                          }
                          setServiceId(s.id);
                          aller(1);
                        }}
                        className={`group flex items-center gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                          choisi ? "border-azur bg-azur/5 ring-1 ring-azur" : "border-bord bg-white hover:border-azur"
                        }`}
                      >
                        <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${c.soft} ${c.text}`}>
                          <ServiceIcon name={s.icone} className="size-5" />
                        </span>
                        <span className="min-w-0 text-sm leading-tight font-semibold hyphens-auto wrap-break-word">{s.nom}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {etape === 1 && service && (
              <>
                <h2 className="text-2xl font-semibold">With which doctor?</h2>
                <p className="mt-1 text-brume">{service.nom}</p>
                {medecinsDuService.length === 0 && (
                  <p className="mt-6 rounded-lg border border-bord bg-creme p-5 text-sm text-brume">
                    No practitioner is attached to this department at the moment.
                  </p>
                )}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {medecinsDuService.map((d) => {
                    const choisi = d.id === medecinId;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        disabled={!d.disponible}
                        onClick={() => {
                          if (d.id !== medecinId) setHeure(null);
                          setMedecinId(d.id);
                          aller(2);
                        }}
                        className={`flex items-center gap-4 rounded-lg border p-3 text-left transition-colors disabled:opacity-55 ${
                          choisi ? "border-azur bg-azur/5 ring-1 ring-azur" : "border-bord bg-white enabled:hover:border-azur"
                        }`}
                      >
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-voile">
                          <Image
                            src={src(d.photo, portraitParDefaut(d.id), 160)}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover object-top"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[15px] font-semibold">
                            {d.titre} {d.prenom} {d.nom}
                          </span>
                          <span className="block text-sm text-brume">{d.specialite}</span>
                          <span className={`mt-1 inline-block text-xs font-semibold ${d.disponible ? "text-menthe" : "text-brume"}`}>
                            {d.disponible ? "Accepting new patients" : "Currently unavailable"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <NavEtapes onPrev={() => aller(0)} />
              </>
            )}

            {etape === 2 && medecin && (
              <>
                <h2 className="text-xl font-bold">Which day and time?</h2>
                <p className="mt-1 text-brume">
                  {medecin.titre} {medecin.prenom} {medecin.nom} · {medecin.specialite}
                </p>
                <div className="-mx-1 mt-6 flex snap-x gap-2 overflow-x-auto px-1 pb-3">
                  {jours.map((j) => {
                    const d = parseDate(j);
                    const choisi = j === date;
                    return (
                      <button
                        key={j}
                        type="button"
                        onClick={() => {
                          setDate(j);
                          setHeure(null);
                        }}
                        className={`w-18 shrink-0 snap-start rounded-lg border py-2.5 text-center transition-colors ${
                          choisi ? "border-azur bg-azur text-white" : "border-bord bg-white text-encre hover:border-azur"
                        }`}
                      >
                        <span className="block text-[11px] font-semibold uppercase opacity-70">
                          {d.toLocaleDateString("en-GB", { weekday: "short" })}
                        </span>
                        <span className="block font-display text-xl font-bold">{d.getDate()}</span>
                        <span className="block text-[11px] font-semibold opacity-70">{d.toLocaleDateString("en-GB", { month: "short" })}</span>
                      </button>
                    );
                  })}
                </div>
                {date ? (
                  <Creneaux medecinId={medecin.id} date={date} choisi={heure} onChoisir={setHeure} />
                ) : (
                  <p className="mt-6 rounded-lg border border-bord bg-creme p-6 text-center text-sm text-brume">
                    Choose a date to display the available time slots.
                  </p>
                )}
                {alerteCreneau && !heure && <p className="mt-4 text-sm font-semibold text-corail">{alerteCreneau}</p>}
                <NavEtapes onPrev={() => aller(1)} onNext={date && heure ? () => aller(3) : undefined} />
              </>
            )}

            {etape === 3 && service && medecin && date && heure && jeton && (
              <>
                <h2 className="text-xl font-bold">Check your inbox</h2>
                <div className="mt-4">
                  <CodeEmailForm
                    jeton={jeton}
                    email={state.data?.email ?? ""}
                    confirmer={confirmerRendezVous}
                    onResult={resultatCode}
                    onRetour={() => setJeton(null)}
                    retourLabel="← Edit my information"
                  >
                    Confirm my appointment <Check className="size-4" />
                  </CodeEmailForm>
                </div>
              </>
            )}

            {etape === 3 && service && medecin && date && heure && !jeton && (
              <form action={action} className="grid gap-4" noValidate>
                <h2 className="text-xl font-bold">A few details</h2>
                <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-bord bg-creme p-4 text-sm font-semibold">
                  <CalendarCheck className="size-4 text-azur" />
                  {dateLongue(date)} at {fmtHeure(heure)} — {medecin.titre} {medecin.nom} ({service.nom})
                </div>
                <input type="hidden" name="service_id" value={service.id} />
                <input type="hidden" name="medecin_id" value={medecin.id} />
                <input type="hidden" name="date_rdv" value={date} />
                <input type="hidden" name="heure" value={heure} />
                <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                  <Field label="Child's full name" name="enfant_nom" error={state.errors?.enfant_nom}>
                    <input {...bind(state, "enfant_nom")} className="field" required />
                  </Field>
                  <Field label="Age" name="enfant_age" error={state.errors?.enfant_age}>
                    <input {...bind(state, "enfant_age")} type="number" min={0} max={18} className="field" required />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Parent's name" name="parent_nom" error={state.errors?.parent_nom}>
                    <input {...bind(state, "parent_nom")} className="field" autoComplete="name" required />
                  </Field>
                  <Field label="E-mail" name="email" error={state.errors?.email}>
                    <input {...bind(state, "email")} type="email" className="field" autoComplete="email" required />
                  </Field>
                  <Field label="Phone" name="telephone" error={state.errors?.telephone}>
                    <input {...bind(state, "telephone")} type="tel" className="field" autoComplete="tel" required />
                  </Field>
                </div>
                <Field label="Reason for the consultation" name="motif" error={state.errors?.motif} hint="A few words are enough (symptoms, follow-up, check-up…)">
                  <textarea {...bind(state, "motif")} rows={3} maxLength={500} className="field resize-none" required />
                </Field>
                <FormAlert state={state.ok ? ETAT_INITIAL : state} />
                <p className="text-xs text-brume">A confirmation code will be sent to you by e-mail to validate the booking.</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button type="button" onClick={() => aller(2)} className="btn btn-secondaire">
                    <ArrowLeft className="size-4" /> Back
                  </button>
                  <SubmitButton pending={pending}>
                    Confirm the appointment <Check className="size-4" />
                  </SubmitButton>
                </div>
              </form>
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function NavEtapes({ onPrev, onNext }: { onPrev: () => void; onNext?: () => void }) {
  return (
    <div className="mt-8 flex justify-between gap-3">
      <button type="button" onClick={onPrev} className="btn btn-secondaire">
        <ArrowLeft className="size-4" /> Back
      </button>
      <button type="button" onClick={onNext} disabled={!onNext} className="btn btn-primaire">
        Continue <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

function Creneaux({ medecinId, date, choisi, onChoisir }: { medecinId: number; date: string; choisi: string | null; onChoisir: (h: string) => void }) {
  const cle = `${medecinId}|${date}`;
  const [res, setRes] = useState<{ cle: string; pris: string[] } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/creneaux?medecin=${medecinId}&date=${date}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then((d: { pris: string[] }) => {
        setErreur(null);
        setRes({ cle: `${medecinId}|${date}`, pris: d.pris });
      })
      .catch((e) => e.name !== "AbortError" && setErreur("Unable to load the time slots."));
    return () => ctrl.abort();
  }, [medecinId, date]);

  if (erreur) return <p className="mt-6 text-sm font-semibold text-corail">{erreur}</p>;
  if (!res || res.cle !== cle)
    return (
      <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {CRENEAUX.map((h) => (
          <div key={h} className="skeleton h-12 rounded-xl" />
        ))}
      </div>
    );

  const libres = CRENEAUX.filter((h) => !res.pris.includes(h)).length;
  return (
    <div className="mt-6">
      <p className="mb-3 text-sm font-bold text-brume">
        {libres} time slot{pluriel(libres)} available
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {CRENEAUX.map((h, i) => {
          const pris = res.pris.includes(h);
          const actif = h === choisi;
          return (
            <m.button
              key={h}
              type="button"
              disabled={pris}
              onClick={() => onChoisir(h)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              className={`rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                pris
                  ? "cursor-not-allowed border-bord bg-voile text-brume/70 line-through"
                  : actif
                    ? "border-azur bg-azur text-white"
                    : "border-bord bg-white hover:border-azur hover:text-azur"
              }`}
            >
              {fmtHeure(h)}
            </m.button>
          );
        })}
      </div>
    </div>
  );
}

function Confirmation({ reference, service, medecin, date, heure }: { reference: string; service?: Service; medecin?: Medecin; date: string; heure: string }) {
  const [copie, setCopie] = useState(false);
  return (
    <div className="card p-8 text-center sm:p-12">
      <m.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto grid size-14 place-items-center rounded-full bg-menthe/10 text-menthe"
      >
        <Check className="size-7" />
      </m.div>
      <h2 className="mt-5 text-2xl font-bold">Appointment request recorded</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-brume">
        The department’s office will confirm the time slot within 48 hours. Keep your reference to
        track or cancel this appointment.
      </p>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(reference).then(() => setCopie(true), () => {});
        }}
        className="mx-auto mt-6 flex items-center gap-3 rounded-lg border border-dashed border-azur bg-azur/5 px-5 py-3 font-mono text-xl font-bold tracking-[0.2em] text-azur"
        title="Copy the reference"
      >
        {reference} {copie ? <Check className="size-5" /> : <Copy className="size-5" />}
      </button>
      <dl className="mx-auto mt-8 grid max-w-md gap-2.5 rounded-lg border border-bord bg-creme p-5 text-left text-sm">
        <div className="flex justify-between gap-4"><dt className="text-brume">Date</dt><dd className="text-right font-semibold">{dateLongue(date)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-brume">Time</dt><dd className="font-semibold">{fmtHeure(heure)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-brume">Doctor</dt><dd className="text-right font-semibold">{medecin?.titre} {medecin?.prenom} {medecin?.nom}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-brume">Department</dt><dd className="text-right font-semibold">{service?.nom}</dd></div>
      </dl>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/rendez-vous/suivi?ref=${reference}`} className="btn btn-primaire">
          Track my appointment
        </Link>
        <Link href="/" className="btn btn-secondaire">
          Back to home
        </Link>
      </div>
    </div>
  );
}
