import type { Metadata } from "next";
import { Bus, Car, Clock, Coffee, Train, Wifi } from "lucide-react";
import { PageHero, SectionTitle } from "@/components/site/PageHero";
import { Faq } from "@/components/site/Faq";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Infos pratiques",
  description: "Horaires de visite, accès, valise d'hospitalisation, services aux familles et questions fréquentes.",
};

const HORAIRES = [
  { qui: "Parents", quand: "24h/24", detail: "Un parent peut dormir dans la chambre (lit accompagnant).", e: "👨‍👩‍👧" },
  { qui: "Frères & sœurs", quand: "12h – 20h", detail: "Dès 3 ans, en l'absence de maladie contagieuse.", e: "🧒" },
  { qui: "Famille & amis", quand: "14h – 20h", detail: "2 visiteurs maximum à la fois par chambre.", e: "👵" },
  { qui: "Urgences", quand: "24h/24", detail: "Un seul accompagnant auprès de l'enfant.", e: "🚑" },
];

const VALISE = [
  ["🧸", "Son doudou préféré"],
  ["👕", "Pyjamas et vêtements confortables"],
  ["🪥", "Trousse de toilette"],
  ["🩴", "Chaussons"],
  ["📒", "Carnet de santé"],
  ["💳", "Carte Vitale & mutuelle"],
  ["📚", "Livres, jeux, tablette"],
  ["🔌", "Chargeur de téléphone"],
];

const FAQ = [
  { q: "Puis-je rester dormir auprès de mon enfant ?", r: "Oui ! Chaque chambre dispose d'un lit accompagnant pour un parent. Une Maison des parents est également disponible à 200 m pour les familles venant de loin." },
  { q: "Mon enfant peut-il continuer l'école ?", r: "Oui, l'école à l'hôpital accueille les enfants de la maternelle au lycée, en classe ou en chambre. Les enseignants sont en lien avec l'école habituelle." },
  { q: "Comment se passe une opération ?", r: "Une visite du bloc est proposée avant l'intervention. Le jour J, votre enfant peut descendre en petite voiture électrique et vous l'accompagnez jusqu'à l'endormissement." },
  { q: "Les repas sont-ils adaptés aux allergies ?", r: "Absolument. Nos diététiciennes adaptent tous les repas aux allergies, régimes et préférences culturelles. Signalez-les dès l'admission." },
  { q: "Comment inscrire mon enfant aux activités ?", r: "Directement depuis la page Activités du site, ou auprès de l'équipe d'animation dans le service. Toutes les activités sont gratuites." },
  { q: "Que faire en cas d'urgence la nuit ?", r: "Appelez le 15 ou venez directement aux urgences pédiatriques (rez-de-chaussée, aile A), ouvertes 24h/24 et 7j/7." },
];

export default function InfosPage() {
  return (
    <>
      <PageHero emoji="🧭" titre="Infos pratiques" sousTitre="Tout ce qu'il faut savoir pour préparer votre venue et rendre le séjour plus doux." ton="menthe" />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <Reveal><SectionTitle kicker="Visites" titre="Horaires de visite" /></Reveal>
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HORAIRES.map((h) => (
            <StaggerItem key={h.qui} className="card p-6 text-center">
              <div className="text-4xl">{h.e}</div>
              <h3 className="mt-3 text-lg font-semibold">{h.qui}</h3>
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-display font-semibold text-emerald-700">
                <Clock className="size-4" /> {h.quand}
              </p>
              <p className="mt-3 text-sm text-brume">{h.detail}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2">
          <Reveal>
            <SectionTitle center={false} kicker="Préparer le séjour" titre="La valise du petit héros" texte="Une petite liste pour ne rien oublier — et surtout pas le doudou !" />
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {VALISE.map(([e, t]) => (
                <li key={t} className="flex items-center gap-3 rounded-2xl bg-creme p-3 text-sm font-bold transition-transform hover:-translate-y-0.5 hover:rotate-[-1deg]">
                  <span className="text-2xl">{e}</span> {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionTitle center={false} kicker="Accès" titre="Venir à l'hôpital" />
            <div className="mt-8 grid gap-3">
              {[
                { i: <Train className="size-5" />, t: "Métro", d: "Ligne 7 — station Petits-Héros (sortie 2)" },
                { i: <Bus className="size-5" />, t: "Bus", d: "Lignes 21, 47 et 83 — arrêt Hôpital" },
                { i: <Car className="size-5" />, t: "Parking", d: "Gratuit pour les parents d'enfants hospitalisés" },
                { i: <Coffee className="size-5" />, t: "Cafétéria", d: "Rez-de-chaussée, de 7h à 21h" },
                { i: <Wifi className="size-5" />, t: "Wi-Fi", d: "Gratuit dans tout l'hôpital (réseau « PetitsHeros »)" },
              ].map((x) => (
                <div key={x.t} className="flex items-center gap-4 rounded-2xl bg-creme p-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-menthe shadow-sm">{x.i}</span>
                  <span>
                    <span className="block font-extrabold">{x.t}</span>
                    <span className="block text-sm text-brume">{x.d}</span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <Reveal><SectionTitle kicker="FAQ" titre="Questions fréquentes" /></Reveal>
        <div className="mt-10">
          <Faq items={FAQ} />
        </div>
      </section>
    </>
  );
}
