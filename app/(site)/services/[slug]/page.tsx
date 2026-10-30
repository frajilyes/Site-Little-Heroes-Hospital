import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BedDouble, CalendarCheck, MapPin, Phone, Siren, Stethoscope } from "lucide-react";
import { getMedecinsByService, getService } from "@/lib/data";
import { COULEURS } from "@/lib/theme";
import { ACTUALITE_PAR_DEFAUT, PHOTOS_SERVICES, src } from "@/lib/images";
import { ServiceIcon } from "@/components/ui/Icon";
import { MedecinCard } from "@/components/site/Cards";
import { Trame } from "@/components/site/Decor";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = await getService((await params).slug);
  return service ? { title: service.nom, description: service.accroche } : { title: "Department not found" };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const service = await getService((await params).slug);
  if (!service) notFound();
  const medecins = await getMedecinsByService(service.id);
  const c = COULEURS[service.couleur];
  const taux = service.lits_total ? Math.round((service.lits_occupes / service.lits_total) * 100) : 0;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-marine">
        <Image
          src={src(service.photo, PHOTOS_SERVICES[service.slug] ?? ACTUALITE_PAR_DEFAUT, 1800)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-linear-to-r from-marine via-marine/90 to-marine/40" />
        <Trame className="opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-24">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" /> All departments
          </Link>
          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-white/12 ring-1 ring-white/25 backdrop-blur-sm">
              <ServiceIcon name={service.icone} className="size-8 text-white" />
            </span>
            <div>
              {service.urgence_24h === 1 && (
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-corail px-2 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
                  <Siren className="size-3" /> Open 24/7
                </span>
              )}
              <h1 className="animate-rise text-4xl font-bold text-balance text-white sm:text-5xl">{service.nom}</h1>
              <p className="animate-rise mt-3 max-w-2xl text-lg text-white/80" style={{ animationDelay: "0.1s" }}>
                {service.accroche}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-12 grid max-w-7xl gap-6 px-4 lg:grid-cols-[1fr_340px] lg:items-start">
        <Reveal className="card p-8">
          <h2 className="text-2xl font-bold">Department overview</h2>
          <p className="mt-4 leading-relaxed whitespace-pre-line text-brume">{service.description}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { i: <BedDouble className="size-4" />, l: "Beds", v: `${service.lits_total}` },
              { i: <Stethoscope className="size-4" />, l: "Practitioners", v: `${service.nb_medecins}` },
              { i: <Siren className="size-4" />, l: "Access", v: service.urgence_24h ? "24/7" : "By appointment" },
            ].map((x) => (
              <div key={x.l} className="rounded-lg border border-bord bg-creme p-4">
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-brume">{x.i} {x.l}</div>
                <div className="mt-1 font-display text-xl font-bold text-encre">{x.v}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="card p-6">
          <h2 className="font-display text-[15px] font-bold">Practical information</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            <li className="flex gap-2.5">
              <MapPin className={`mt-0.5 size-4 shrink-0 ${c.text}`} /> {service.etage}
            </li>
            <li className="flex gap-2.5">
              <Phone className={`mt-0.5 size-4 shrink-0 ${c.text}`} />
              <a href={`tel:${service.telephone.replace(/\s/g, "")}`} className="font-semibold hover:underline">
                {service.telephone}
              </a>
            </li>
          </ul>
          <div className="mt-6 border-t border-bord pt-5">
            <div className="flex justify-between text-[13px] font-medium text-brume">
              <span>Beds occupied</span>
              <span className="font-bold text-encre">{service.lits_occupes}/{service.lits_total}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-voile">
              <div className={`h-full rounded-full ${c.bg}`} style={{ width: `${taux}%` }} />
            </div>
          </div>
          <Link href={`/rendez-vous?service=${service.id}`} className="btn btn-primaire mt-6 w-full text-sm">
            <CalendarCheck className="size-4" /> Book an appointment
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold">The medical team</h2>
        {medecins.length === 0 ? (
          <p className="card mt-6 p-8 text-center text-sm text-brume">
            The directory of practitioners for this department is being updated.
          </p>
        ) : (
          <Stagger className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {medecins.map((d) => (
              <StaggerItem key={d.id}>
                <MedecinCard medecin={d} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </>
  );
}
