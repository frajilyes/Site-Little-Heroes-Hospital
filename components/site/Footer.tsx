import Link from "next/link";
import { Clock, Heart, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";

const COLONNES = [
  {
    titre: "L'hôpital",
    liens: [
      ["/services", "Nos services"],
      ["/medecins", "Nos médecins"],
      ["/activites", "Activités pour les enfants"],
      ["/actualites", "Actualités"],
      ["/admin", "Espace personnel"],
    ],
  },
  {
    titre: "Familles",
    liens: [
      ["/rendez-vous", "Prendre rendez-vous"],
      ["/infos-pratiques", "Infos pratiques & FAQ"],
      ["/espace-enfants", "Espace enfants"],
      ["/contact", "Nous contacter"],
      ["/dons", "Faire un don"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-encre text-white/80">
      <svg className="absolute -top-px left-0 h-10 w-full text-creme" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
        <path fill="currentColor" d="M0 0h1440v20c-120 25-240 38-360 30S840 20 720 20 480 45 360 48 120 38 0 20z" />
      </svg>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-20 pb-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-block rounded-2xl bg-white/95 p-3">
            <Logo />
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            Un hôpital pensé pour les enfants : des soins d&apos;excellence, beaucoup de douceur et toujours un sourire.
          </p>
        </div>
        {COLONNES.map((col) => (
          <div key={col.titre}>
            <h3 className="font-display text-lg font-semibold text-white">{col.titre}</h3>
            <ul className="mt-4 grid gap-2 text-sm">
              {col.liens.map(([href, label]) => (
                <li key={href}>
                  <Link className="transition-colors hover:text-soleil" href={href}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h3 className="font-display text-lg font-semibold text-white">Nous trouver</h3>
          <ul className="mt-4 grid gap-3 text-sm">
            <li className="flex gap-2"><MapPin className="size-4 shrink-0 text-soleil" /> 12 rue des Petits Héros, 75000 Paris</li>
            <li className="flex gap-2"><Phone className="size-4 shrink-0 text-soleil" /> 01 23 45 67 00</li>
            <li className="flex gap-2"><Mail className="size-4 shrink-0 text-soleil" /> contact@petitsheros.fr</li>
            <li className="flex gap-2"><Clock className="size-4 shrink-0 text-soleil" /> Visites 12h – 20h · Parents 24h/24</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-white/60">
          <span>© {new Date().getFullYear()} Hôpital des Petits Héros — établissement fictif de démonstration.</span>
          <span className="flex items-center gap-1">
            Fait avec <Heart className="size-3.5 fill-corail text-corail" /> pour les enfants
          </span>
        </p>
      </div>
    </footer>
  );
}
