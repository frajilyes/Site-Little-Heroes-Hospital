import Link from "next/link";
import { Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";

const COLONNES = [
  {
    titre: "The hospital",
    liens: [
      ["/services", "Our departments"],
      ["/medecins", "Our doctors"],
      ["/actualites", "News"],
      ["/activites", "Activities for children"],
      ["/admin", "Staff area"],
    ],
  },
  {
    titre: "Patients and families",
    liens: [
      ["/rendez-vous", "Book an appointment"],
      ["/rendez-vous/suivi", "Track an appointment"],
      ["/infos-pratiques", "Prepare your visit"],
      ["/espace-enfants", "Kids' Corner"],
      ["/dons", "Make a donation"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-marine text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo ton="clair" />
          <p className="mt-5 text-sm leading-relaxed">
            A leading pediatric hospital, from birth to age 18. Emergency care open
            around the clock, specialized departments, and support for families at every step.
          </p>
          <p className="mt-5 flex items-center gap-2 text-xs font-medium text-white/55">
            <ShieldCheck className="size-4 text-ciel" />
            Certified by the French National Authority for Health — Level A
          </p>
        </div>

        {COLONNES.map((col) => (
          <nav key={col.titre} aria-label={col.titre}>
            <h2 className="font-display text-sm font-bold tracking-wide text-white uppercase">{col.titre}</h2>
            <ul className="mt-4 grid gap-2.5 text-sm">
              {col.liens.map(([href, label]) => (
                <li key={href}>
                  <Link className="transition-colors hover:text-white" href={href}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="font-display text-sm font-bold tracking-wide text-white uppercase">Contact us</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ciel" /> 12 Little Heroes Street, 75000 Paris
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-ciel" />
              <a href="tel:0123456700" className="transition-colors hover:text-white">01 23 45 67 00</a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-ciel" />
              <a href="mailto:contact@petitsheros.fr" className="transition-colors hover:text-white">
                contact@petitsheros.fr
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-ciel" /> Visiting hours 12pm – 8pm · Parents admitted 24/7
            </li>
          </ul>
          <Link href="/contact" className="btn btn-clair mt-5 w-full text-sm">
            Write to the hospital
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-5 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Little Heroes Hospital — a fictional demo hospital.</p>
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/infos-pratiques" className="transition-colors hover:text-white">Legal notice</Link>
            <Link href="/infos-pratiques" className="transition-colors hover:text-white">Patients’ rights</Link>
            <span>Photos: Unsplash</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
