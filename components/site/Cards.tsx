import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Clock, Languages, Siren } from "lucide-react";
import { ServiceIcon } from "@/components/ui/Icon";
import { COULEURS } from "@/lib/theme";
import { dateLongue } from "@/lib/format";
import { ACTUALITE_PAR_DEFAUT, PHOTOS_SERVICES, portraitParDefaut, src } from "@/lib/images";
import type { Actualite, Medecin, Service } from "@/lib/types";

export function ServiceCard({ service }: { service: Service }) {
  const c = COULEURS[service.couleur];
  const taux = service.lits_total ? Math.round((service.lits_occupes / service.lits_total) * 100) : 0;
  return (
    <Link
      href={`/services/${service.slug}`}
      className="card group flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-[0_12px_28px_-16px_rgb(13_35_64/0.35)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-voile">
        <Image
          src={src(service.photo, PHOTOS_SERVICES[service.slug] ?? ACTUALITE_PAR_DEFAUT, 800)}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-marine/55 to-transparent" />
        <span className={`absolute bottom-3 left-3 grid size-10 place-items-center rounded-lg text-white ${c.bg}`}>
          <ServiceIcon name={service.icone} className="size-5" />
        </span>
        {service.urgence_24h === 1 && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-corail px-2 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
            <Siren className="size-3" /> 24h/24
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[17px] font-bold">{service.nom}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-brume">{service.accroche}</p>
        <div className="mt-4 flex items-center justify-between border-t border-bord pt-3 text-[13px]">
          <span className="flex items-center gap-1.5 font-medium text-brume">
            <BedDouble className="size-4" /> {service.lits_total} beds · {taux} % occupied
          </span>
          <span className="flex items-center gap-1 font-semibold text-azur">
            Details <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function MedecinCard({ medecin }: { medecin: Medecin }) {
  const c = COULEURS[medecin.couleur];
  return (
    <article className="card group flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-[0_12px_28px_-16px_rgb(13_35_64/0.35)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-voile">
        <Image
          src={src(medecin.photo, portraitParDefaut(medecin.id), 600)}
          alt={`Portrait of ${medecin.titre} ${medecin.prenom} ${medecin.nom}`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span
          className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${
            medecin.disponible ? "bg-white text-menthe" : "bg-white/90 text-brume"
          }`}
        >
          <span className={`size-1.5 rounded-full ${medecin.disponible ? "bg-menthe" : "bg-brume"}`} />
          {medecin.disponible ? "Taking appointments" : "Fully booked"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[17px] font-bold">
          {medecin.titre} {medecin.prenom} {medecin.nom}
        </h3>
        <p className={`mt-0.5 text-sm font-semibold ${c.text}`}>{medecin.specialite}</p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-brume">{medecin.bio}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-brume">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" /> {medecin.experience_ans} years in practice
          </span>
          <span className="flex items-center gap-1.5">
            <Languages className="size-3.5" /> {medecin.langues}
          </span>
        </div>
        {medecin.disponible ? (
          <Link
            href={`/rendez-vous?service=${medecin.service_id}&medecin=${medecin.id}`}
            className="btn btn-secondaire mt-4 w-full text-sm"
          >
            Book an appointment
          </Link>
        ) : (
          <p className="mt-4 rounded-lg bg-voile py-2.5 text-center text-[13px] font-medium text-brume">
            No time slot currently open
          </p>
        )}
      </div>
    </article>
  );
}

export function ActuCard({ actu, large = false }: { actu: Actualite; large?: boolean }) {
  return (
    <Link
      href={`/actualites/${actu.slug}`}
      className="card group flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-[0_12px_28px_-16px_rgb(13_35_64/0.35)]"
    >
      <div className={`relative overflow-hidden bg-voile ${large ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
        <Image
          src={src(actu.image, ACTUALITE_PAR_DEFAUT, large ? 1200 : 800)}
          alt=""
          fill
          sizes={large ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-bold tracking-wide text-marine uppercase">
          {actu.categorie}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <time className="text-[13px] font-medium text-brume" dateTime={actu.date_pub}>
          {dateLongue(actu.date_pub)}
        </time>
        <h3 className={`mt-1.5 font-bold text-balance ${large ? "text-2xl" : "text-[17px]"}`}>{actu.titre}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-brume">{actu.resume}</p>
        <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-azur">
          Read the article <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
