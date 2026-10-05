import Link from "next/link";
import { ArrowRight, BedDouble, CalendarClock, HandHeart, Hourglass, Mail, Palette } from "lucide-react";
import { getDashboardStats, getMessages, getRdvParJour, getRendezVous, getServices } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { dateLongue, euros, heure, ilYA, STATUTS_RDV, toISODate } from "@/lib/format";
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
  const h = new Date().getHours();

  const tuiles = [
    { l: "Enfants hospitalisés", v: occupes, s: `${Math.round((occupes / stats.lits_total) * 100)} % des ${stats.lits_total} lits`, i: BedDouble, c: "bg-violet-100 text-violet-700", href: "/admin/patients" },
    { l: "RDV aujourd'hui", v: stats.rdv_aujourdhui, s: "hors annulations", i: CalendarClock, c: "bg-sky-100 text-sky-700", href: "/admin/rendez-vous" },
    { l: "RDV à confirmer", v: stats.rdv_en_attente, s: "en attente", i: Hourglass, c: "bg-amber-100 text-amber-800", href: "/admin/rendez-vous?statut=en_attente" },
    { l: "Messages non lus", v: stats.messages_non_lus, s: "boîte de réception", i: Mail, c: "bg-rose-100 text-rose-700", href: "/admin/messages" },
    { l: "Inscriptions activités", v: stats.inscriptions_semaine, s: "7 prochains jours", i: Palette, c: "bg-emerald-100 text-emerald-700", href: "/admin/activites" },
    { l: "Dons (30 jours)", v: Number(stats.dons_mois), s: "promesses de don", i: HandHeart, c: "bg-orange-100 text-orange-700", href: "/admin", euro: true },
  ];

  return (
    <>
      <AdminHeader
        titre={`${h < 18 ? "Bonjour" : "Bonsoir"} ${session?.nom ?? ""} 👋`}
        sousTitre={`Nous sommes le ${dateLongue(aujourdhui)}. Voici l'activité de l'hôpital.`}
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tuiles.map((t) => (
          <StaggerItem key={t.l}>
            <Link href={t.href} className="group card flex items-center gap-4 p-5 transition-all hover:-translate-y-1 hover:shadow-xl">
              <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${t.c} transition-transform group-hover:scale-110 group-hover:-rotate-6`}>
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
          <h2 className="text-xl font-semibold">Rendez-vous par jour</h2>
          <p className="mb-6 text-sm text-brume">14 derniers jours et 7 prochains jours</p>
          <RdvParJourChart data={parJour} aujourdhui={aujourdhui} />
        </section>
        <section className="card min-w-0 p-6">
          <h2 className="text-xl font-semibold">Occupation des lits</h2>
          <p className="mb-5 text-sm text-brume">Patients hospitalisés ou en observation</p>
          <OccupationChart data={services.map((s) => ({ nom: s.nom, occupes: Number(s.lits_occupes), total: s.lits_total }))} />
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="card min-w-0 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Consultations du jour</h2>
            <Link href="/admin/rendez-vous" className="flex items-center gap-1 text-sm font-extrabold text-ciel">
              Tout voir <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-2">
            {rdvDuJour.length === 0 && <li className="rounded-2xl bg-creme p-4 text-sm font-bold text-brume">Aucune consultation aujourd&apos;hui.</li>}
            {rdvDuJour.map((r) => (
              <li key={r.id} className="flex items-center gap-4 rounded-2xl bg-creme p-3">
                <span className={`grid h-12 w-16 shrink-0 place-items-center rounded-xl font-display font-semibold text-white ${COULEURS[r.couleur].bg}`}>
                  {heure(r.heure)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold">{r.enfant_nom} <span className="font-bold text-brume">({r.enfant_age} an{r.enfant_age > 1 ? "s" : ""})</span></span>
                  <span className="block truncate text-xs text-brume">{r.medecin_nom} · {r.service_nom}</span>
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${STATUTS_RDV[r.statut].cls}`}>{STATUTS_RDV[r.statut].label}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card min-w-0 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Messages non lus</h2>
            <Link href="/admin/messages" className="flex items-center gap-1 text-sm font-extrabold text-ciel">
              Boîte de réception <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-2">
            {nonLus.length === 0 && <li className="rounded-2xl bg-creme p-4 text-sm font-bold text-brume">Tout est lu, bravo ! 🎉</li>}
            {nonLus.map((x) => (
              <li key={x.id} className="rounded-2xl bg-creme p-4">
                <div className="flex justify-between gap-2">
                  <span className="truncate font-extrabold">{x.sujet}</span>
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
