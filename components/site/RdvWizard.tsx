"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, Copy } from "lucide-react";
import { m } from "@/components/ui/motion";
import { ServiceIcon } from "@/components/ui/Icon";
import { bind, Confetti, ETAT_INITIAL, Field, FormAlert, SubmitButton } from "@/components/ui/Form";
import { confirmerRendezVous, prendreRendezVous } from "@/app/actions/public";
import { CodeEmailForm } from "./CodeEmailForm";
import { CRENEAUX } from "@/lib/constants";
import { COULEURS } from "@/lib/theme";
import { dateLongue, heure as fmtHeure, parseDate, toISODate } from "@/lib/format";
import type { FormState, Medecin, Service } from "@/lib/types";

const ETAPES = ["Service", "Médecin", "Créneau", "Vos infos"];

/** Prochains jours ouvrés (à partir de demain). */
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

  // Jeton de la demande en attente du code reçu par e-mail, puis référence du RDV confirmé
  const [jeton, setJeton] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [alerteCreneau, setAlerteCreneau] = useState<string | null>(null);

  const aller = (n: number) => {
    setDirection(n > etape ? 1 : -1);
    setEtape(n);
    // Revenir sur le choix du créneau abandonne le code déjà envoyé
    if (n < 3) setJeton(null);
  };

  // Si le créneau a été pris entre-temps, on renvoie à l'étape créneau
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
      {/* Progression */}
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
                    animate={{ scale: actif ? 1.1 : 1, backgroundColor: fait ? "#3ccfa5" : actif ? "#ff6b6b" : "#f1ebe2" }}
                    className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-extrabold ${fait || actif ? "text-white" : "text-brume"}`}
                  >
                    {fait ? <Check className="size-4" /> : i + 1}
                  </m.span>
                  <span className={`hidden text-sm font-extrabold md:block ${actif ? "text-encre" : "text-brume"}`}>{nom}</span>
                </button>
                {i < ETAPES.length - 1 && (
                  <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-[#f1ebe2]">
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
                <h2 className="text-2xl font-semibold">Pour quel service ?</h2>
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
                        className={`group flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 ${
                          choisi ? `border-transparent ${c.soft} ring-4 ${c.ring}` : "border-[#f1ebe2] bg-white hover:border-transparent hover:shadow-lg"
                        }`}
                      >
                        <span className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${c.grad} text-white transition-transform group-hover:rotate-[-8deg]`}>
                          <ServiceIcon name={s.icone} className="size-5" />
                        </span>
                        <span className="min-w-0 text-sm leading-tight font-extrabold break-words hyphens-auto">{s.nom}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {etape === 1 && service && (
              <>
                <h2 className="text-2xl font-semibold">Avec quel médecin ?</h2>
                <p className="mt-1 text-brume">{service.nom}</p>
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
                        className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all enabled:hover:-translate-y-0.5 enabled:hover:shadow-lg disabled:opacity-50 ${
                          choisi ? "border-corail bg-rose-50" : "border-[#f1ebe2] bg-white"
                        }`}
                      >
                        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-creme text-3xl">{d.avatar}</span>
                        <span>
                          <span className="block font-extrabold">
                            {d.titre} {d.prenom} {d.nom}
                          </span>
                          <span className="block text-sm text-brume">{d.specialite}</span>
                          <span className={`mt-1 inline-block text-xs font-extrabold ${d.disponible ? "text-emerald-600" : "text-slate-500"}`}>
                            {d.disponible ? "● Prend de nouveaux patients" : "Indisponible actuellement"}
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
                <h2 className="text-2xl font-semibold">Quel jour et à quelle heure ?</h2>
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
                        className={`w-[72px] shrink-0 snap-start rounded-2xl py-3 text-center transition-all ${
                          choisi ? "scale-105 bg-encre text-white shadow-lg" : "bg-creme text-encre hover:bg-amber-100"
                        }`}
                      >
                        <span className="block text-xs font-bold uppercase opacity-70">
                          {d.toLocaleDateString("fr-FR", { weekday: "short" })}
                        </span>
                        <span className="block font-display text-2xl font-semibold">{d.getDate()}</span>
                        <span className="block text-xs font-bold opacity-70">{d.toLocaleDateString("fr-FR", { month: "short" })}</span>
                      </button>
                    );
                  })}
                </div>
                {date ? (
                  <Creneaux medecinId={medecin.id} date={date} choisi={heure} onChoisir={setHeure} />
                ) : (
                  <p className="mt-6 rounded-2xl bg-creme p-6 text-center font-bold text-brume">👆 Choisissez une date pour voir les créneaux libres</p>
                )}
                {alerteCreneau && !heure && <p className="mt-4 text-sm font-bold text-corail">{alerteCreneau}</p>}
                <NavEtapes onPrev={() => aller(1)} onNext={date && heure ? () => aller(3) : undefined} />
              </>
            )}

            {etape === 3 && service && medecin && date && heure && jeton && (
              <>
                <h2 className="text-2xl font-semibold">Vérifiez votre boîte mail</h2>
                <div className="mt-4">
                  <CodeEmailForm
                    jeton={jeton}
                    email={state.data?.email ?? ""}
                    confirmer={confirmerRendezVous}
                    onResult={resultatCode}
                    onRetour={() => setJeton(null)}
                    retourLabel="← Modifier mes informations"
                  >
                    Valider mon rendez-vous <Check className="size-4" />
                  </CodeEmailForm>
                </div>
              </>
            )}

            {etape === 3 && service && medecin && date && heure && !jeton && (
              <form action={action} className="grid gap-4" noValidate>
                <h2 className="text-2xl font-semibold">Quelques informations</h2>
                <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-creme p-4 text-sm font-bold">
                  <CalendarCheck className="size-5 text-corail" />
                  {dateLongue(date)} à {fmtHeure(heure)} — {medecin.titre} {medecin.nom} ({service.nom})
                </div>
                <input type="hidden" name="service_id" value={service.id} />
                <input type="hidden" name="medecin_id" value={medecin.id} />
                <input type="hidden" name="date_rdv" value={date} />
                <input type="hidden" name="heure" value={heure} />
                <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                  <Field label="Nom et prénom de l'enfant" name="enfant_nom" error={state.errors?.enfant_nom}>
                    <input {...bind(state, "enfant_nom")} className="field" required />
                  </Field>
                  <Field label="Âge" name="enfant_age" error={state.errors?.enfant_age}>
                    <input {...bind(state, "enfant_age")} type="number" min={0} max={18} className="field" required />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Nom du parent" name="parent_nom" error={state.errors?.parent_nom}>
                    <input {...bind(state, "parent_nom")} className="field" autoComplete="name" required />
                  </Field>
                  <Field label="E-mail" name="email" error={state.errors?.email}>
                    <input {...bind(state, "email")} type="email" className="field" autoComplete="email" required />
                  </Field>
                  <Field label="Téléphone" name="telephone" error={state.errors?.telephone}>
                    <input {...bind(state, "telephone")} type="tel" className="field" autoComplete="tel" required />
                  </Field>
                </div>
                <Field label="Motif de la consultation" name="motif" error={state.errors?.motif} hint="Quelques mots suffisent (symptômes, suivi, contrôle…)">
                  <textarea {...bind(state, "motif")} rows={3} maxLength={500} className="field resize-none" required />
                </Field>
                <FormAlert state={state.ok ? ETAT_INITIAL : state} />
                <p className="text-xs text-brume">Un code de confirmation vous sera envoyé par e-mail pour valider la réservation.</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button type="button" onClick={() => aller(2)} className="btn bg-creme text-encre">
                    <ArrowLeft className="size-4" /> Retour
                  </button>
                  <SubmitButton pending={pending}>
                    Confirmer le rendez-vous <Check className="size-4" />
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
      <button type="button" onClick={onPrev} className="btn bg-creme text-encre">
        <ArrowLeft className="size-4" /> Retour
      </button>
      <button type="button" onClick={onNext} disabled={!onNext} className="btn bg-encre text-white">
        Continuer <ArrowRight className="size-4" />
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
      .catch((e) => e.name !== "AbortError" && setErreur("Impossible de charger les créneaux."));
    return () => ctrl.abort();
  }, [medecinId, date]);

  if (erreur) return <p className="mt-6 font-bold text-corail">{erreur}</p>;
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
        {libres} créneau{libres > 1 ? "x" : ""} disponible{libres > 1 ? "s" : ""}
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
              className={`rounded-xl py-3 text-sm font-extrabold transition-all ${
                pris
                  ? "cursor-not-allowed bg-slate-100 text-slate-400 line-through"
                  : actif
                    ? "scale-105 bg-corail text-white shadow-lg shadow-corail/30"
                    : "bg-white ring-2 ring-[#f1ebe2] hover:ring-corail"
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
    <div className="card relative overflow-hidden p-8 text-center sm:p-12">
      <Confetti />
      <m.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="mx-auto grid size-24 place-items-center rounded-full bg-emerald-100 text-5xl"
      >
        🎉
      </m.div>
      <h2 className="mt-6 text-3xl font-semibold">Rendez-vous enregistré !</h2>
      <p className="mx-auto mt-2 max-w-md text-brume">
        Notre secrétariat va le confirmer très vite. Conservez bien votre référence pour le suivre ou l&apos;annuler.
      </p>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(reference).then(() => setCopie(true), () => {});
        }}
        className="mx-auto mt-6 flex items-center gap-3 rounded-2xl border-2 border-dashed border-corail bg-rose-50 px-6 py-4 font-mono text-2xl font-bold tracking-[0.2em] text-corail"
        title="Copier la référence"
      >
        {reference} {copie ? <Check className="size-5" /> : <Copy className="size-5" />}
      </button>
      <dl className="mx-auto mt-8 grid max-w-md gap-2 rounded-2xl bg-creme p-5 text-left text-sm">
        <div className="flex justify-between gap-4"><dt className="font-bold text-brume">Date</dt><dd className="text-right font-extrabold">{dateLongue(date)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="font-bold text-brume">Heure</dt><dd className="font-extrabold">{fmtHeure(heure)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="font-bold text-brume">Médecin</dt><dd className="text-right font-extrabold">{medecin?.titre} {medecin?.prenom} {medecin?.nom}</dd></div>
        <div className="flex justify-between gap-4"><dt className="font-bold text-brume">Service</dt><dd className="text-right font-extrabold">{service?.nom}</dd></div>
      </dl>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/rendez-vous/suivi?ref=${reference}`} className="btn bg-encre text-white">
          Suivre mon rendez-vous
        </Link>
        <Link href="/" className="btn bg-creme text-encre">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
