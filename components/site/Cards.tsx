import Link from "next/link";
import { ArrowRight, BedDouble, Clock, Languages, Siren } from "lucide-react";
import { ServiceIcon } from "@/components/ui/Icon";
import { COULEURS } from "@/lib/theme";
import { dateLongue } from "@/lib/format";
import type { Actualite, Medecin, Service } from "@/lib/types";

export function ServiceCard({ service }: { service: Service }) {
  const c = COULEURS[service.couleur];
  const taux = service.lits_total ? Math.round((service.lits_occupes / service.lits_total) * 100) : 0;
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group card relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
    >
      <div className={`absolute -top-12 -right-12 size-36 rounded-full ${c.soft} transition-transform duration-500 group-hover:scale-150`} />
      <div className={`relative grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${c.grad} text-white shadow-lg transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110`}>
        <ServiceIcon name={service.icone} className="size-7" />
      </div>
      <h3 className="relative mt-5 text-xl font-semibold">{service.nom}</h3>
      <p className="relative mt-2 flex-1 text-sm text-brume">{service.accroche}</p>
      <div className="relative mt-5 flex items-center justify-between text-xs font-bold text-brume">
        {service.urgence_24h ? (
          <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-rose-700">
            <Siren className="size-3.5" /> 24h/24
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <BedDouble className="size-4" /> {service.lits_total} lits · {taux}%
          </span>
        )}
        <span className={`flex items-center gap-1 ${c.text}`}>
          Découvrir <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function MedecinCard({ medecin }: { medecin: Medecin }) {
  const c = COULEURS[medecin.couleur];
  return (
    <article className="group card flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
      <div className={`relative h-28 bg-gradient-to-br ${c.grad}`}>
        <div className="bg-dots absolute inset-0 opacity-40" />
        <span
          className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
            medecin.disponible ? "bg-white text-emerald-700" : "bg-white/70 text-slate-500"
          }`}
        >
          {medecin.disponible ? "● Disponible" : "Indisponible"}
        </span>
        <div className="absolute -bottom-10 left-6 grid size-20 place-items-center rounded-3xl bg-white text-5xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          {medecin.avatar}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6 pt-12">
        <h3 className="text-lg font-semibold">
          {medecin.titre} {medecin.prenom} {medecin.nom}
        </h3>
        <p className={`text-sm font-bold ${c.text}`}>{medecin.specialite}</p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm text-brume">{medecin.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-brume">
          <span className="flex items-center gap-1 rounded-full bg-creme px-2.5 py-1">
            <Clock className="size-3.5" /> {medecin.experience_ans} ans
          </span>
          <span className="flex items-center gap-1 rounded-full bg-creme px-2.5 py-1">
            <Languages className="size-3.5" /> {medecin.langues}
          </span>
        </div>
        {medecin.disponible ? (
          <Link
            href={`/rendez-vous?service=${medecin.service_id}&medecin=${medecin.id}`}
            className={`btn mt-5 w-full ${c.soft} ${c.text}`}
          >
            Prendre rendez-vous
          </Link>
        ) : (
          <p className="mt-5 rounded-full bg-slate-100 py-3 text-center text-sm font-bold text-slate-500">
            Pas de nouveaux rendez-vous
          </p>
        )}
      </div>
    </article>
  );
}

export function ActuCard({ actu, large = false }: { actu: Actualite; large?: boolean }) {
  const c = COULEURS[actu.couleur];
  return (
    <Link
      href={`/actualites/${actu.slug}`}
      className="group card flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
    >
      <div className={`relative grid place-items-center overflow-hidden bg-gradient-to-br ${c.grad} ${large ? "h-64" : "h-44"}`}>
        <div className="bg-dots absolute inset-0 opacity-30" />
        <span className={`relative transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6 ${large ? "text-8xl" : "text-6xl"}`}>
          {actu.emoji}
        </span>
        <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-encre">
          {actu.categorie}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <time className="text-xs font-bold text-brume" dateTime={actu.date_pub}>
          {dateLongue(actu.date_pub)}
        </time>
        <h3 className={`mt-2 font-semibold text-balance ${large ? "text-2xl" : "text-lg"}`}>{actu.titre}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-brume">{actu.resume}</p>
        <span className={`mt-4 flex items-center gap-1 text-sm font-extrabold ${c.text}`}>
          Lire la suite <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
