import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BedDouble, CalendarHeart, MapPin, Phone, Siren, Stethoscope } from "lucide-react";
import { getMedecinsByService, getService } from "@/lib/data";
import { COULEURS } from "@/lib/theme";
import { ServiceIcon } from "@/components/ui/Icon";
import { MedecinCard } from "@/components/site/Cards";
import { Blob, Clouds } from "@/components/site/Decor";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = await getService((await params).slug);
  return service ? { title: service.nom, description: service.accroche } : { title: "Service introuvable" };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const service = await getService((await params).slug);
  if (!service) notFound();
  const medecins = await getMedecinsByService(service.id);
  const c = COULEURS[service.couleur];
  const taux = service.lits_total ? Math.round((service.lits_occupes / service.lits_total) * 100) : 0;

  return (
    <>
      <section className={`relative -mt-[76px] overflow-hidden bg-gradient-to-br pt-[76px] ${c.grad}`}>
        <Clouds />
        <Blob className="-right-16 -bottom-16 size-80 bg-white/30" />
        <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-20 text-white">
          <Link href="/services" className="inline-flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/30">
            <ArrowLeft className="size-4" /> Tous les services
          </Link>
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="grid size-24 shrink-0 animate-pop place-items-center rounded-[2rem] bg-white shadow-2xl">
              <ServiceIcon name={service.icone} className={`size-12 ${c.text}`} />
            </div>
            <div>
              <h1 className="animate-rise text-4xl font-semibold text-balance sm:text-6xl">{service.nom}</h1>
              <p className="mt-3 animate-rise text-lg text-white/90" style={{ animationDelay: "0.15s" }}>
                {service.accroche}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-10 grid max-w-7xl gap-8 px-4 lg:grid-cols-[1fr_360px]">
        <Reveal className="card relative p-8">
          <h2 className="text-2xl font-semibold">Le service</h2>
          <p className="mt-4 leading-relaxed whitespace-pre-line text-brume">{service.description}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { i: <BedDouble className="size-5" />, l: "Lits", v: `${service.lits_total}` },
              { i: <Stethoscope className="size-5" />, l: "Médecins", v: `${service.nb_medecins}` },
              { i: <Siren className="size-5" />, l: "Accueil", v: service.urgence_24h ? "24h/24" : "Sur RDV" },
            ].map((x) => (
              <div key={x.l} className={`rounded-2xl p-4 ${c.soft}`}>
                <div className={`flex items-center gap-2 text-sm font-bold ${c.text}`}>{x.i} {x.l}</div>
                <div className="mt-1 font-display text-2xl font-semibold">{x.v}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="card h-fit p-6">
          <h2 className="text-lg font-semibold">Infos pratiques</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            <li className="flex gap-3"><MapPin className={`size-5 shrink-0 ${c.text}`} /> {service.etage}</li>
            <li className="flex gap-3">
              <Phone className={`size-5 shrink-0 ${c.text}`} />
              <a href={`tel:${service.telephone.replace(/\s/g, "")}`} className="font-bold hover:underline">{service.telephone}</a>
            </li>
          </ul>
          <div className="mt-6">
            <div className="flex justify-between text-sm font-bold">
              <span>Occupation</span>
              <span>{service.lits_occupes}/{service.lits_total}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${c.bg}`} style={{ width: `${taux}%` }} />
            </div>
          </div>
          <Link href={`/rendez-vous?service=${service.id}`} className="btn mt-6 w-full bg-corail text-white shadow-lg shadow-corail/30">
            <CalendarHeart className="size-4" /> Prendre rendez-vous
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl font-semibold">L&apos;équipe médicale</h2>
        <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {medecins.map((d) => (
            <StaggerItem key={d.id}>
              <MedecinCard medecin={d} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
