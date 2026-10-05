import Link from "next/link";
import { ArrowRight, CalendarHeart, HeartHandshake, MapPin, Quote, ShieldCheck, Sparkles, Star as StarIcon, Users } from "lucide-react";
import { getActivitesDuJour, getActualites, getMedecins, getPublicStats, getServices, getTemoignages } from "@/lib/data";
import { heure } from "@/lib/format";
import { CATEGORIES, COULEURS } from "@/lib/theme";
import { ActuCard, MedecinCard, ServiceCard } from "@/components/site/Cards";
import { Balloon, Blob, Clouds, Star, Wave } from "@/components/site/Decor";
import { HospitalIllustration } from "@/components/site/HospitalIllustration";
import { SectionTitle } from "@/components/site/PageHero";
import { Appear, CountUp, DrawPath, Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

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

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative -mt-[76px] overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-creme pt-[76px]">
        <Clouds />
        <Blob className="top-40 -left-24 size-80 bg-soleil/30" />
        <Blob className="-right-20 bottom-0 size-96 bg-corail/20" />
        <Balloon color="#ff6b6b" className="absolute top-32 left-[4%] hidden w-10 md:block" />
        <Balloon color="#9b8cff" className="absolute top-52 left-[46%] hidden w-8 lg:block" delay="-2s" />
        <Balloon color="#3ccfa5" className="absolute right-[3%] bottom-40 hidden w-9 md:block" delay="-4s" />
        <Star className="absolute top-36 right-[38%] size-6 animate-spin-slow" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-12 pb-24 lg:grid-cols-2 lg:pt-20 lg:pb-32">
          <div>
            <p
              className="animate-rise inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-extrabold text-encre shadow-sm backdrop-blur"
            >
              <Sparkles className="size-4 text-soleil" /> Hôpital pédiatrique de 0 à 18 ans
            </p>
            <h1
              style={{ animationDelay: "0.1s" }}
              className="animate-rise mt-6 text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl lg:text-7xl"
            >
              Ici, chaque enfant est un{" "}
              <span className="relative inline-block text-corail">
                héros
                <svg viewBox="0 0 200 20" className="absolute -bottom-2 left-0 w-full" aria-hidden>
                  <DrawPath d="M3 14 Q 50 2 100 10 T 197 8" stroke="#ffc93c" strokeWidth={6} delay={0.8} />
                </svg>
              </span>
              .
            </h1>
            <p
              style={{ animationDelay: "0.25s" }}
              className="animate-rise mt-6 max-w-xl text-lg text-pretty text-brume"
            >
              Des soins d&apos;excellence dans un univers pensé pour les enfants : 8 services spécialisés, des urgences
              ouvertes jour et nuit, et des activités tous les jours pour soigner aussi le moral.
            </p>
            <div
              style={{ animationDelay: "0.4s" }}
              className="animate-rise mt-8 flex flex-wrap gap-3"
            >
              <Link href="/rendez-vous" className="btn bg-corail px-7 py-4 text-base text-white shadow-xl shadow-corail/30">
                <CalendarHeart className="size-5" /> Prendre rendez-vous
              </Link>
              <Link href="/activites" className="btn bg-white px-7 py-4 text-base text-encre shadow-lg shadow-black/5">
                Voir les activités <ArrowRight className="size-5" />
              </Link>
            </div>
            <ul
              style={{ animationDelay: "0.55s" }}
              className="animate-rise mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-brume"
            >
              <li className="flex items-center gap-2"><ShieldCheck className="size-5 text-menthe" /> Certifié Haute Qualité</li>
              <li className="flex items-center gap-2"><Users className="size-5 text-ciel" /> Parents accueillis 24h/24</li>
              <li className="flex items-center gap-2"><MapPin className="size-5 text-corail" /> Paris, accès métro</li>
            </ul>
          </div>

          <Appear
            y={0}
            scale={0.9}
            rotate={-3}
            delay={0.2}
            spring
            className="relative mx-auto w-full max-w-lg"
          >
            <HospitalIllustration className="w-full drop-shadow-2xl" />
            <div className="card absolute top-8 -left-2 flex animate-float items-center gap-3 px-4 py-3 sm:-left-8">
              <span className="grid size-10 place-items-center rounded-xl bg-rose-100 text-xl">🚑</span>
              <span className="text-sm leading-tight font-extrabold">
                Urgences<br /><span className="font-bold text-brume">ouvertes 24h/24</span>
              </span>
            </div>
            <div className="card absolute -right-2 bottom-16 flex animate-float-slow items-center gap-3 px-4 py-3 sm:-right-6">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-xl">🎨</span>
              <span className="text-sm leading-tight font-extrabold">
                {stats.activites} activités<br /><span className="font-bold text-brume">chaque semaine</span>
              </span>
            </div>
          </Appear>
        </div>
        <Wave className="h-12 text-white" />
      </section>

      {/* ============================ CHIFFRES ============================ */}
      <section className="bg-white">
        <Stagger className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-14 lg:grid-cols-4">
          {[
            { v: stats.enfants_soignes, l: "enfants soignés", e: "🧒", c: "text-corail" },
            { v: stats.medecins, l: "médecins spécialistes", e: "🩺", c: "text-ciel" },
            { v: stats.lits, l: "lits pédiatriques", e: "🛏️", c: "text-lavande" },
            { v: stats.activites, l: "activités par semaine", e: "🎈", c: "text-menthe" },
          ].map((s) => (
            <StaggerItem key={s.l} className="text-center">
              <div className="text-3xl">{s.e}</div>
              <div className={`mt-2 font-display text-4xl font-semibold sm:text-5xl ${s.c}`}>
                <CountUp value={s.v} />
              </div>
              <div className="mt-1 text-sm font-bold text-brume">{s.l}</div>
            </StaggerItem>
          ))}
        </Stagger>
        <Wave className="h-12 text-creme" />
      </section>

      {/* ============================ SERVICES ============================ */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <Reveal>
          <SectionTitle
            kicker="Nos spécialités"
            titre="8 services, une seule priorité : votre enfant"
            texte="Des équipes pluridisciplinaires formées à la pédiatrie, de la naissance à l'adolescence."
          />
        </Reveal>
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <StaggerItem key={s.id}>
              <ServiceCard service={s} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ============================ AUJOURD'HUI ============================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 py-20">
        <Blob className="-top-10 right-10 size-64 bg-white/60" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <Reveal>
            <SectionTitle
              center={false}
              kicker="Aujourd'hui à l'hôpital"
              titre="On soigne aussi avec des sourires"
              texte="Clowns, musique, chiens câlins, ateliers créatifs… Chaque jour, des animateurs et bénévoles font oublier l'hôpital le temps d'une activité."
            />
            <Link href="/activites" className="btn mt-8 bg-encre text-white">
              Tout le programme <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {activites.length === 0 && (
              <StaggerItem className="card p-6 text-brume sm:col-span-2">Pas d&apos;activité programmée aujourd&apos;hui — revenez demain !</StaggerItem>
            )}
            {activites.map((a) => {
              const c = COULEURS[CATEGORIES[a.categorie].couleur];
              const restantes = a.places - a.inscrits;
              return (
                <StaggerItem key={a.id}>
                  <Link href={`/activites?jour=${a.jour}#activite-${a.id}`} className="group card flex items-center gap-4 p-4 transition-transform hover:-translate-y-1 hover:rotate-[-0.5deg]">
                    <span className={`grid size-16 shrink-0 place-items-center rounded-2xl text-3xl ${c.soft} transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                      {a.emoji}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-lg font-semibold">{a.titre}</span>
                      <span className="block text-sm font-bold text-brume">
                        {heure(a.heure_debut)} – {heure(a.heure_fin)} · {a.lieu}
                      </span>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-extrabold ${restantes > 0 ? `${c.soft} ${c.text}` : "bg-slate-100 text-slate-500"}`}>
                        {restantes > 0 ? `${restantes} place${restantes > 1 ? "s" : ""}` : "Complet"}
                      </span>
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* ============================ PARCOURS ============================ */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <Reveal>
          <SectionTitle kicker="Simple comme bonjour" titre="Un rendez-vous en 4 étapes" />
        </Reveal>
        <div className="relative mt-14 grid gap-8 md:grid-cols-4">
          <svg className="absolute top-10 left-[12%] hidden h-4 w-[76%] md:block" viewBox="0 0 400 10" preserveAspectRatio="none" aria-hidden>
            <path d="M0 5 H400" stroke="#1e2a4a" strokeOpacity=".15" strokeWidth="3" strokeDasharray="8 10" />
          </svg>
          {[
            { e: "🏥", t: "Choisissez le service", d: "Cardiologie, neurologie, allergologie…" },
            { e: "👩‍⚕️", t: "Choisissez le médecin", d: "Découvrez nos spécialistes et leur parcours." },
            { e: "📅", t: "Choisissez le créneau", d: "Les disponibilités s'affichent en temps réel." },
            { e: "🎉", t: "C'est confirmé !", d: "Vous recevez une référence de rendez-vous." },
          ].map((step, i) => (
            <Reveal key={step.t} delay={i * 0.12} className="relative text-center">
              <div className="relative mx-auto grid size-20 place-items-center rounded-[1.75rem] bg-white text-4xl shadow-xl transition-transform hover:scale-110 hover:rotate-6">
                {step.e}
                <span className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-corail text-sm font-extrabold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{step.t}</h3>
              <p className="mt-1 text-sm text-brume">{step.d}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <Link href="/rendez-vous" className="btn bg-corail px-8 py-4 text-white shadow-xl shadow-corail/30">
            <CalendarHeart className="size-5" /> Je prends rendez-vous
          </Link>
        </Reveal>
      </section>

      {/* ============================ MÉDECINS ============================ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <SectionTitle center={false} kicker="Nos équipes" titre="Des spécialistes au grand cœur" />
            </Reveal>
            <Link href="/medecins" className="btn bg-creme text-encre">
              Tous les médecins <ArrowRight className="size-4" />
            </Link>
          </div>
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {medecinsDispo.map((d) => (
              <StaggerItem key={d.id}>
                <MedecinCard medecin={d} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============================ TÉMOIGNAGES ============================ */}
      <section className="overflow-hidden py-20">
        <Reveal>
          <SectionTitle kicker="Ils nous font confiance" titre="Les mots des familles" />
        </Reveal>
        <div className="group relative mt-12 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused]">
            {[...temoignages, ...temoignages].map((t, i) => (
              <figure key={i} className="card w-80 shrink-0 p-6 sm:w-96" aria-hidden={i >= temoignages.length}>
                <Quote className="size-8 text-soleil" />
                <blockquote className="mt-3 text-pretty text-encre">{t.texte}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-creme text-2xl">{t.avatar}</span>
                  <span>
                    <span className="block font-extrabold">{t.auteur}</span>
                    <span className="block text-xs font-bold text-brume">{t.role}</span>
                  </span>
                  <span className="ml-auto flex" aria-label={`${t.note} sur 5`}>
                    {Array.from({ length: t.note }).map((_, k) => (
                      <StarIcon key={k} className="size-4 fill-soleil text-soleil" />
                    ))}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ ACTUALITÉS ============================ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionTitle center={false} kicker="Quoi de neuf ?" titre="Les dernières actualités" />
          </Reveal>
          <Link href="/actualites" className="btn bg-white text-encre shadow-sm">
            Toutes les actualités <ArrowRight className="size-4" />
          </Link>
        </div>
        <Stagger className="mt-10 grid gap-6 md:grid-cols-3">
          {actus.map((a) => (
            <StaggerItem key={a.id}>
              <ActuCard actu={a} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ============================ DON ============================ */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-corail via-rose-500 to-lavande px-8 py-14 text-white shadow-2xl shadow-corail/30 sm:px-14">
            <Blob className="-top-16 -right-16 size-72 bg-soleil/40" />
            <Balloon color="#ffc93c" className="absolute top-6 right-[8%] w-12" />
            <Balloon color="#ffffff" className="absolute right-[20%] bottom-4 w-8 opacity-70" delay="-3s" />
            <div className="relative max-w-2xl">
              <HeartHandshake className="size-12" />
              <h2 className="mt-4 text-4xl font-semibold text-balance sm:text-5xl">Offrez un sourire à un enfant hospitalisé</h2>
              <p className="mt-4 text-lg text-white/90">
                Salles de jeux, docteurs clowns, recherche, maison des parents : chaque don compte. Déjà{" "}
                <strong className="font-extrabold"><CountUp value={stats.dons_total} suffix=" €" /></strong> collectés grâce à vous.
              </p>
              <Link href="/dons" className="btn mt-8 bg-white px-8 py-4 text-corail shadow-xl">
                Je fais un don <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
