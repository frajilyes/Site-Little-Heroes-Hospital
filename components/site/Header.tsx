"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { CalendarHeart, Menu, Phone, X } from "lucide-react";
import { m } from "@/components/ui/motion";
import { Logo } from "./Logo";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services" },
  { href: "/medecins", label: "Médecins" },
  { href: "/activites", label: "Activités" },
  { href: "/actualites", label: "Actualités" },
  { href: "/infos-pratiques", label: "Infos pratiques" },
  { href: "/espace-enfants", label: "Espace enfants" },
];

const NAV_MOBILE = [...NAV, { href: "/contact", label: "Contact" }, { href: "/dons", label: "Faire un don" }];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermer le menu mobile à chaque navigation
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* Bandeau urgences */}
      <div className="bg-encre text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs font-bold sm:text-sm">
          <p className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-corail opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-corail" />
            </span>
            Urgences pédiatriques 24h/24 — 7j/7
          </p>
          <a href="tel:15" className="flex items-center gap-1.5 hover:text-soleil">
            <Phone className="size-3.5" /> SAMU : 15<span className="hidden sm:inline"> · Accueil : 01 23 45 67 00</span>
          </a>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-creme/85 shadow-[0_8px_30px_-12px_rgb(30_42_74/0.18)] backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all ${scrolled ? "py-2.5" : "py-4"}`}>
          <Link href="/" aria-label="Accueil — Hôpital des Petits Héros">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`relative isolate rounded-full px-3.5 py-2 text-sm font-bold transition-colors ${
                  isActive(item.href) ? "text-encre" : "text-brume hover:text-encre"
                }`}
              >
                {isActive(item.href) && (
                  <m.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/rendez-vous" className="btn hidden bg-corail text-white shadow-lg shadow-corail/30 sm:inline-flex">
              <CalendarHeart className="size-4" /> Prendre RDV
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="grid size-11 place-items-center rounded-2xl bg-white shadow-sm lg:hidden"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <m.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-black/5 bg-creme lg:hidden"
              aria-label="Navigation mobile"
            >
              <div className="grid gap-1 px-4 py-4">
                {NAV_MOBILE.map((item, i) => (
                  <m.div key={item.href} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.035 }}>
                    <Link
                      href={item.href}
                      className={`block rounded-2xl px-4 py-3 font-bold ${isActive(item.href) ? "bg-white text-encre shadow-sm" : "text-brume"}`}
                    >
                      {item.label}
                    </Link>
                  </m.div>
                ))}
                <Link href="/rendez-vous" className="btn mt-2 bg-corail text-white">
                  <CalendarHeart className="size-4" /> Prendre rendez-vous
                </Link>
              </div>
            </m.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
