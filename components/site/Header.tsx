"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { CalendarCheck, ChevronRight, Menu, Phone, Search, X } from "lucide-react";
import { m } from "@/components/ui/motion";
import { Pastille } from "./Decor";
import { Logo } from "./Logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Departments" },
  { href: "/medecins", label: "Doctors" },
  { href: "/activites", label: "Activities" },
  { href: "/actualites", label: "News" },
  { href: "/infos-pratiques", label: "Practical Info" },
  { href: "/espace-enfants", label: "Kids' Corner" },
];

const NAV_MOBILE = [...NAV, { href: "/contact", label: "Contact" }, { href: "/dons", label: "Make a donation" }];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on every navigation
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* Service banner */}
      <div className="bg-marine text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[13px]">
          <p className="flex items-center gap-2 font-medium">
            <Pastille />
            <span className="hidden sm:inline">Pediatric emergency open</span> 24/7
          </p>
          <div className="flex items-center gap-4">
            <a href="tel:15" className="flex items-center gap-1.5 font-semibold transition-colors hover:text-ciel">
              <Phone className="size-3.5" /> Emergency: 15
            </a>
            <a href="tel:0123456700" className="hidden font-medium text-white/80 transition-colors hover:text-white sm:inline">
              Phone: 01 23 45 67 00
            </a>
            <Link href="/admin" className="hidden font-medium text-white/60 transition-colors hover:text-white md:inline">
              Staff area
            </Link>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b bg-white transition-shadow duration-200 ${
          scrolled ? "border-bord shadow-[0_4px_16px_-8px_rgb(13_35_64/0.25)]" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3">
          <Link href="/" aria-label="Home — Little Heroes Hospital" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center xl:flex" aria-label="Main navigation">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`relative px-3 py-5 text-sm font-medium transition-colors ${
                  isActive(item.href) ? "text-azur" : "text-encre/75 hover:text-azur"
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <m.span
                    layoutId="nav-trait"
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-azur"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/rendez-vous/suivi"
              className="btn btn-secondaire hidden text-sm md:inline-flex"
            >
              <Search className="size-4" /> Track my appointment
            </Link>
            <Link href="/rendez-vous" className="btn btn-primaire hidden text-sm sm:inline-flex">
              <CalendarCheck className="size-4" /> Book an appointment
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="grid size-10 place-items-center rounded-lg border border-bord text-encre xl:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
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
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-bord bg-white xl:hidden"
              aria-label="Mobile navigation"
            >
              <div className="mx-auto max-w-7xl px-4 py-2">
                {NAV_MOBILE.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between border-b border-bord/70 py-3 text-[15px] font-medium last:border-0 ${
                      isActive(item.href) ? "text-azur" : "text-encre"
                    }`}
                  >
                    {item.label}
                    <ChevronRight className="size-4 text-brume" />
                  </Link>
                ))}
                <Link href="/rendez-vous" className="btn btn-primaire my-3 w-full">
                  <CalendarCheck className="size-4" /> Book an appointment
                </Link>
              </div>
            </m.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
