"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BedDouble, CalendarDays, ExternalLink, LayoutDashboard, LogOut, Mail, Menu, Newspaper, Palette, Stethoscope, X } from "lucide-react";
import { m } from "@/components/ui/motion";
import { Logo } from "@/components/site/Logo";
import { logout } from "@/app/actions/admin";

const LIENS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rendez-vous", label: "Appointments", icon: CalendarDays, badge: "rdv" },
  { href: "/admin/patients", label: "Patients", icon: BedDouble },
  { href: "/admin/activites", label: "Activities", icon: Palette },
  { href: "/admin/medecins", label: "Doctors", icon: Stethoscope },
  { href: "/admin/messages", label: "Messages", icon: Mail, badge: "msg" },
  { href: "/admin/actualites", label: "News", icon: Newspaper },
] as const;

export function Sidebar({ nom, badges }: { nom: string; badges: { rdv: number; msg: number } }) {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOuvert(false);
  }
  const actif = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-bord bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button type="button" onClick={() => setOuvert(true)} className="grid size-10 place-items-center rounded-lg border border-bord" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </div>

      {ouvert && <div className="fixed inset-0 z-40 bg-marine/45 lg:hidden" onClick={() => setOuvert(false)} aria-hidden />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-bord bg-white shadow-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          ouvert ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <Link href="/admin"><Logo /></Link>
          <button type="button" onClick={() => setOuvert(false)} className="lg:hidden" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4" aria-label="Admin navigation">
          {LIENS.map(({ href, label, icon: Icon, ...rest }) => {
            const n = "badge" in rest ? badges[rest.badge] : 0;
            const on = actif(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? "page" : undefined}
                className={`relative isolate flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${on ? "text-white" : "text-brume hover:bg-voile hover:text-encre"}`}
              >
                {on && (
                  <m.span layoutId="admin-nav" className="absolute inset-0 -z-10 rounded-lg bg-azur" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                )}
                <Icon className="size-4.5" />
                <span className="flex-1">{label}</span>
                {n > 0 && (
                  <span className={`grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold ${on ? "bg-white/20 text-white" : "bg-corail text-white"}`}>
                    {n}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-bord p-4">
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-brume hover:bg-voile">
            <ExternalLink className="size-4" /> View public site
          </Link>
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-bord bg-creme p-3">
            <span className="grid size-9 place-items-center rounded-full bg-azur text-sm font-bold text-white">
              {nom.charAt(0)}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{nom}</span>
            <form action={logout}>
              <button className="grid size-8 place-items-center rounded-lg text-brume hover:bg-white hover:text-corail" aria-label="Log out" title="Log out">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
