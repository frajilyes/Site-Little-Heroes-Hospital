import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BedDouble, CalendarCheck, Clock, HeartHandshake, MapPin, Phone, Quote,
  ShieldCheck, Siren, Star as StarIcon, Stethoscope, Users,
} from "lucide-react";
import { getActivitesDuJour, getActualites, getMedecins, getPublicStats, getServices, getTemoignages } from "@/lib/data";
import { heure, pluriel } from "@/lib/format";
import { CATEGORIES, COULEURS } from "@/lib/theme";
import { photo, VISUELS } from "@/lib/images";
import { ServiceIcon } from "@/components/ui/Icon";
import { ActuCard, MedecinCard, ServiceCard } from "@/components/site/Cards";
import { Pastille, Trame } from "@/components/site/Decor";
import { SectionTitle } from "@/components/site/PageHero";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

/** The four most requested entry points, straddling the header. */
function accesRapide(urgences: string) {
  return [
    { href: "/rendez-vous", icone: CalendarCheck, titre: "Book an appointment", texte: "Online booking, 7 days a week" },
    { href: urgences, icone: Siren, titre: "Pediatric emergency", texte: "Open 24/7 — Emergency: 15" },
    { href: "/services", icone: Stethoscope, titre: "Find a department", texte: "Our specialties, ages 0 to 18" },
    { href: "/infos-pratiques", icone: MapPin, titre: "Getting to the hospital", texte: "Access, visits, accommodation" },
  ];
}

const ETAPES = [
  { t: "Choose the department", d: "The hospital's pediatric specialties, from birth to adolescence." },
  { t: "Choose the practitioner", d: "Background, languages spoken, and availability for every doctor." },
  { t: "Book a time slot", d: "Availability shown in real time, no phone call needed." },
  { t: "Confirm by e-mail", d: "A verification code confirms the request and generates your reference." },
];

export default async function Accueil() {
  const [stats, services, activites, medecins, temoignages, actus] = await Promise.all([
    getPublicStats(),
    getServices(),
    getActivitesDuJour(),
    getMedecins(),
    getTemoignages(),
    getActualites(3),
  ]);
  const medecinsDispo = medecins.filter((d) => d.disponible).slice(0, 4);
  const [actuPrincipale, ...autresActus] = actus;
  const urgences = services.find((s) => s.urgence_24h);
  const chiffres = [
    { v: stats.enfants_soignes, l: "children cared for", s: "since opening", i: HeartHandshake },
    { v: stats.medecins, l: "specialized practitioners", s: "pediatrics and surgery", i: Stethoscope },
    { v: stats.lits, l: "hospital beds", s: `across ${stats.services} department${pluriel(stats.services)}`, i: BedDouble },
    { v: stats.activites, l: "activities per week", s: "led by activity coordinators", i: Clock },
  ].filter((c) => c.v > 0);

  return (
    <>
      {/* ============================ HEADER ============================ */}
      <section className="relative isolate overflow-hidden bg-marine">
        <Image
          src={photo(VISUELS.accueilHero, 2000)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-r from-marine via-marine/90 to-marine/30" />
        <Trame className="opacity-50" />

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-28 sm:pt-24 sm:pb-32">
          <div className="max-w-2xl">
            <p className="animate-rise inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold text-white ring-1 ring-white/20">
              <Pastille /> Pediatric emergency always open
            </p>
            <h1
              style={{ animationDelay: "0.08s" }}
              className="animate-rise mt-6 text-4xl leading-[1.08] font-bold text-balance text-white sm:text-5xl lg:text-[3.5rem]"
            >
              Outstanding pediatric care, at a child’s level.
            </h1>
            <p
              style={{ animationDelay: "0.18s" }}
              className="animate-rise mt-5 max-w-xl text-lg text-pretty text-white/80"
            >
              Our specialized departments welcome children from 0 to 18 years old. A
              multidisciplinary team, parents allowed 24/7, and a daily activity program
              so that hospitalization can still feel like childhood.
            </p>
            <div style={{ animationDelay: "0.28s" }} className="animate-rise mt-8 flex flex-wrap gap-3">
              <Link href="/rendez-vous" className="btn btn-clair px-6 py-3">
                <CalendarCheck className="size-5" /> Book an appointment
              </Link>
              <a href="tel:0123456700" className="btn px-6 py-3 text-white ring-1 ring-white/35 hover:bg-white/10">
                <Phone className="size-5" /> 01 23 45 67 00
              </a>
            </div>
            <ul
              style={{ animationDelay: "0.38s" }}
              className="animate-rise mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-white/75"
            >
              <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-ciel" /> HAS level A certification</li>
              <li className="flex items-center gap-2"><Users className="size-4 text-ciel" /> Parents welcome day and night</li>
              <li className="flex items-center gap-2"><MapPin className="size-4 text-ciel" /> Paris 12th — subway line 8</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================ QUICK ACCESS ============================ */}
      <section className="mx-auto -mt-16 max-w-7xl px-4">
        <div className="grid gap-px overflow-hidden rounded-xl border border-bord bg-bord shadow-[0_18px_40px_-28px_rgb(13_35_64/0.5)] sm:grid-cols-2 lg:grid-cols-4">
          {accesRapide(urgences ? `/services/${urgences.slug}` : "/services").map(({ href, icone: Icone, titre, texte }) => (
            <Link key={titre} href={href} className="group flex items-start gap-3.5 bg-white p-5 transition-colors hover:bg-voile">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-azur/10 text-azur transition-colors group-hover:bg-azur group-hover:text-white">
                <Icone className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 font-display text-[15px] font-bold text-encre">
                  {titre}
                  <ArrowRight className="size-3.5 text-azur opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="mt-0.5 block text-[13px] text-brume">{texte}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================ FIGURES ============================ */}
      {chiffres.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <Stagger className="grid grid-cols-2 gap-x-6 gap-y-10 border-y border-bord py-10 lg:grid-cols-4">
            {chiffres.map((s) => (
              <StaggerItem key={s.l} className="lg:border-l lg:border-bord lg:pl-6 lg:first:border-0 lg:first:pl-0">
                <s.i className="size-5 text-azur" />
                <div className="mt-3 font-display text-4xl font-bold tracking-tight text-encre">
                  <CountUp value={s.v} />
                </div>
                <div className="mt-1 text-sm font-semibold text-encre">{s.l}</div>
                <div className="text-[13px] text-brume">{s.s}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {/* ============================ DEPARTMENTS ============================ */}
      {services.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20">
          <Reveal>
            <SectionTitle
              center={false}
              kicker="Our specialties"
              titre="Our departments, continuous care"
              texte="Multidisciplinary teams trained in pediatrics, from birth to adolescence, brought together on a single site."
            />
          </Reveal>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <StaggerItem key={s.id}>
                <ServiceCard service={s} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {/* ============================ JOURNEY ============================ */}
      <section className="border-y border-bord bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <Reveal>
            <SectionTitle
              kicker="Book an appointment"
              titre="Four steps, no waiting line"
              texte="Online booking is open around the clock and confirmed by e-mail."
            />
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {ETAPES.map((step, i) => (
              <Reveal key={step.t} delay={i * 0.08} className="border-t-2 border-azur/25 pt-5">
                <span className="font-display text-sm font-bold text-azur">0{i + 1}</span>
                <h3 className="mt-2 text-[17px] font-bold">{step.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-brume">{step.d}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <Link href="/rendez-vous" className="btn btn-primaire px-6 py-3">
              <CalendarCheck className="size-5" /> Go to appointment booking
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============================ TODAY ============================ */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <Reveal>
            <SectionTitle
              center={false}
              kicker="Today at the hospital"
              titre="Care doesn't stop at treatment"
              texte="Creative workshops, music, animal therapy, clown doctors: every day, activity coordinators and volunteers visit the departments and children's bedsides."
            />
            <div className="relative mt-7 aspect-[16/10] overflow-hidden rounded-xl">
              <Image
                src={photo(VISUELS.activites, 900)}
                alt="Creative workshop led for hospitalized children"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <Link href="/activites" className="btn btn-secondaire mt-6">
              See this week’s program <ArrowRight className="size-4" />
            </Link>
          </Reveal>

          <Reveal delay={0.1} className="card divide-y divide-bord overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <h3 className="font-display text-[15px] font-bold">Today’s program</h3>
              <span className="text-[13px] font-medium text-brume">
                {activites.length} session{pluriel(activites.length)}
              </span>
            </div>
            {activites.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-brume">
                No activity scheduled today. The program resumes tomorrow.
              </p>
            )}
            {activites.map((a) => {
              const cat = CATEGORIES[a.categorie];
              const c = COULEURS[cat.couleur];
              const restantes = a.places - a.inscrits;
              return (
                <Link
                  key={a.id}
                  href={`/activites?jour=${a.jour}#activite-${a.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-voile"
                >
                  <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${c.soft} ${c.text}`}>
                    <ServiceIcon name={cat.icone} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[15px] font-bold">{a.titre}</span>
                    <span className="block text-[13px] text-brume">
                      {heure(a.heure_debut)} – {heure(a.heure_fin)} · {a.lieu}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold ${
                      restantes > 0 ? "bg-menthe/10 text-menthe" : "bg-voile text-brume"
                    }`}
                  >
                    {restantes > 0 ? `${restantes} spot${pluriel(restantes)}` : "Full"}
                  </span>
                </Link>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* ============================ DOCTORS ============================ */}
      {medecinsDispo.length > 0 && (
        <section className="border-y border-bord bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <Reveal>
                <SectionTitle center={false} kicker="Our teams" titre="The practitioners who will see you" />
              </Reveal>
              <Link href="/medecins" className="btn btn-secondaire">
                Full directory <ArrowRight className="size-4" />
              </Link>
            </div>
            <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {medecinsDispo.map((d) => (
                <StaggerItem key={d.id}>
                  <MedecinCard medecin={d} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* ============================ TESTIMONIALS ============================ */}
      {temoignages.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20">
          <Reveal>
            <SectionTitle kicker="Feedback from families" titre="What parents are saying" />
          </Reveal>
          <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
            {temoignages.slice(0, 3).map((t) => (
              <StaggerItem key={t.id}>
                <figure className="card flex h-full flex-col p-6">
                  <Quote className="size-6 text-azur/35" />
                  <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-pretty text-encre">
                    {t.texte}
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-bord pt-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-azur/10 font-display text-sm font-bold text-azur">
                      {t.auteur.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{t.auteur}</span>
                      <span className="block truncate text-[13px] text-brume">{t.role}</span>
                    </span>
                    <span className="ml-auto flex shrink-0" aria-label={`${t.note} out of 5`}>
                      {Array.from({ length: t.note }).map((_, k) => (
                        <StarIcon key={k} className="size-3.5 fill-soleil text-soleil" />
                      ))}
                    </span>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {/* ============================ NEWS ============================ */}
      {actus.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <SectionTitle center={false} kicker="Hospital life" titre="Latest news" />
            </Reveal>
            <Link href="/actualites" className="btn btn-secondaire">
              All news <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Reveal>
              <ActuCard actu={actuPrincipale} large />
            </Reveal>
            <div className="grid gap-5">
              {autresActus.map((a, i) => (
                <Reveal key={a.id} delay={0.08 * (i + 1)}>
                  <ActuCard actu={a} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================ DONATIONS ============================ */}
      <section className="relative isolate overflow-hidden bg-marine">
        <Image src={photo(VISUELS.dons, 1800)} alt="" fill sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-linear-to-r from-marine via-marine/90 to-marine/55" />
        <div className="relative mx-auto max-w-7xl px-4 py-20">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-ciel">Support the hospital</p>
            <h2 className="mt-2.5 text-3xl font-bold text-balance text-white sm:text-4xl">
              Funding what health insurance doesn’t cover
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Play rooms, clown doctors, pediatric research, accommodation for families who have
              traveled far: your donations fund daily life for hospitalized children.
              {stats.dons_total > 0 && (
                <>
                  {" "}
                  <strong className="font-semibold text-white">
                    <CountUp value={stats.dons_total} suffix=" €" />
                  </strong>{" "}
                  have already been raised thanks to donors.
                </>
              )}
            </p>
            <Link href="/dons" className="btn btn-clair mt-8 px-6 py-3">
              <HeartHandshake className="size-5" /> Make a donation
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
