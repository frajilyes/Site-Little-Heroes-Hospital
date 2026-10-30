import Link from "next/link";
import { ArrowRight, BedDouble, CalendarClock, HandHeart, Hourglass, Mail, Palette } from "lucide-react";
import { getDashboardStats, getMessages, getRdvParJour, getRendezVous, getServices } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { dateLongue, euros, heure, ilYA, pluriel, STATUTS_RDV, toISODate } from "@/lib/format";
import { COULEURS } from "@/lib/theme";
import { AdminHeader } from "@/components/admin/ui";
import { OccupationChart, RdvParJourChart } from "@/components/admin/Charts";
import { CountUp, Stagger, StaggerItem } from "@/components/ui/motion";

export default async function Dashboard() {
  const [session, stats, parJour, services, rdvs, messages] = await Promise.all([
    getSession(),
    getDashboardStats(),
    getRdvParJour(),
    getServices(),
    getRendezVous("tous"),
    getMessages(),
  ]);
  const aujourdhui = toISODate(new Date());
  const rdvDuJour = rdvs.filter((r) => r.date_rdv === aujourdhui && r.statut !== "annule");
  const nonLus = messages.filter((x) => !x.lu).slice(0, 4);
  const occupes = Number(stats.hospitalises) + Number(stats.observation);
  const tauxOccupation = stats.lits_total ? Math.round((occupes / stats.lits_total) * 100) : 0;
  // "Good morning" stood alone against "Good evening" with the cut-off at 18:00, which
  // greeted every afternoon visit with "Good morning". English needs the third case.
  const h = new Date().getHours();
  const salutation = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

  const tuiles = [
    { l: "Hospitalized children", v: occupes, s: `${tauxOccupation} % of ${stats.lits_total} beds`, i: BedDouble, c: "bg-violet-100 text-violet-700", href: "/admin/patients" },
    { l: "Appointments today", v: stats.rdv_aujourdhui, s: "excluding cancellations", i: CalendarClock, c: "bg-sky-100 text-sky-700", href: "/admin/rendez-vous" },
    { l: "Appointments to confirm", v: stats.rdv_en_attente, s: "pending", i: Hourglass, c: "bg-amber-100 text-amber-800", href: "/admin/rendez-vous?statut=en_attente" },
    { l: "Unread messages", v: stats.messages_non_lus, s: "inbox", i: Mail, c: "bg-rose-100 text-rose-700", href: "/admin/messages" },
    { l: "Activity sign-ups", v: stats.inscriptions_semaine, s: "next 7 days", i: Palette, c: "bg-emerald-100 text-emerald-700", href: "/admin/activites" },
    { l: "Donations (30 days)", v: Number(stats.dons_mois), s: "donation pledges", i: HandHeart, c: "bg-orange-100 text-orange-700", href: "/admin", euro: true },
  ];

  return (
    <>
      <AdminHeader
        titre={`${salutation} ${session?.nom ?? ""}`}
        sousTitre={`Today is ${dateLongue(aujourdhui)}. Here's what's happening at the hospital.`}
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tuiles.map((t) => (
          <StaggerItem key={t.l}>
            <Link href={t.href} className="group card flex items-center gap-4 p-5 transition-shadow hover:shadow-[0_12px_28px_-16px_rgb(13_35_64/0.35)]">
              <span className={`grid size-12 shrink-0 place-items-center rounded-lg ${t.c}`}>
                <t.i className="size-6" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-brume">{t.l}</span>
                <span className="block font-display text-3xl font-semibold">
                  {t.euro ? euros(t.v) : <CountUp value={t.v} duration={1} />}
                </span>
                <span className="block text-xs text-brume">{t.s}</span>
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="card min-w-0 p-6">
          <h2 className="text-xl font-semibold">Appointments per day</h2>
          <p className="mb-6 text-sm text-brume">Last 14 days and next 7 days</p>
          <RdvParJourChart data={parJour} aujourdhui={aujourdhui} />
        </section>
        <section className="card min-w-0 p-6">
          <h2 className="text-xl font-semibold">Bed occupancy</h2>
          <p className="mb-5 text-sm text-brume">Hospitalized or under-observation patients</p>
          <OccupationChart data={services.map((s) => ({ nom: s.nom, occupes: Number(s.lits_occupes), total: s.lits_total }))} />
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="card min-w-0 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today’s consultations</h2>
            <Link href="/admin/rendez-vous" className="flex items-center gap-1 text-sm font-semibold text-azur">
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-2">
            {rdvDuJour.length === 0 && <li className="rounded-lg bg-creme p-4 text-sm font-bold text-brume">No consultations today.</li>}
            {rdvDuJour.map((r) => (
              <li key={r.id} className="flex items-center gap-4 rounded-lg bg-creme p-3">
                <span className={`grid h-12 w-16 shrink-0 place-items-center rounded-xl font-display font-semibold text-white ${COULEURS[r.couleur].bg}`}>
                  {heure(r.heure)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{r.enfant_nom} <span className="font-bold text-brume">({r.enfant_age} yr{pluriel(r.enfant_age)})</span></span>
                  <span className="block truncate text-xs text-brume">{r.medecin_nom} · {r.service_nom}</span>
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUTS_RDV[r.statut].cls}`}>{STATUTS_RDV[r.statut].label}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card min-w-0 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Unread messages</h2>
            <Link href="/admin/messages" className="flex items-center gap-1 text-sm font-semibold text-azur">
              Inbox <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-2">
            {nonLus.length === 0 && <li className="rounded-lg border border-bord bg-creme p-4 text-sm text-brume">No unread messages.</li>}
            {nonLus.map((x) => (
              <li key={x.id} className="rounded-lg bg-creme p-4">
                <div className="flex justify-between gap-2">
                  <span className="truncate font-bold">{x.sujet}</span>
                  <span className="shrink-0 text-xs text-brume">{ilYA(x.created_at)}</span>
                </div>
                <p className="truncate text-sm text-brume">{x.nom} — {x.message}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
