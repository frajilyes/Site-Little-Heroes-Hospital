"use client";

import { useState } from "react";
import { m } from "@/components/ui/motion";

// Une seule série par graphique : bleu de la palette de référence (contraste ≥ 4,5:1 sur blanc).
const SERIE = "#2a78d6";
const SERIE_PASSE = "#a9c9ef"; // même teinte, plus claire : jours passés
const GRILLE = "#ece6dc";
const TEXTE_2 = "#5b6787";

const fmtJour = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric" });
const fmtLong = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const versDate = (iso: string) => {
  const [y, mo, d] = iso.split("-").map(Number);
  return new Date(y, mo - 1, d, 12);
};

/** Rendez-vous par jour (14 jours passés + 7 à venir). */
export function RdvParJourChart({ data, aujourdhui }: { data: { jour: string; total: number; annules: number }[]; aujourdhui: string }) {
  const [survol, setSurvol] = useState<number | null>(null);
  const max = Math.max(4, ...data.map((d) => d.total));
  const pas = max <= 5 ? 1 : Math.ceil(max / 4);
  const graduations = Array.from({ length: Math.floor(max / pas) + 1 }, (_, i) => i * pas);
  const H = 180;

  return (
    <figure>
      <div className="relative flex gap-2">
        {/* Axe Y */}
        <div className="relative w-6 shrink-0 text-right text-[11px] font-bold" style={{ height: H, color: TEXTE_2 }} aria-hidden>
          {graduations.map((g) => (
            <span key={g} className="absolute right-0 -translate-y-1/2" style={{ bottom: (g / max) * H - 6 }}>
              {g}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          {/* Grille */}
          {graduations.map((g) => (
            <div key={g} className="absolute inset-x-0 border-t" style={{ bottom: (g / max) * H, borderColor: GRILLE }} aria-hidden />
          ))}
          <div className="relative flex items-end gap-[2px]" style={{ height: H }} role="list">
            {data.map((d, i) => {
              const passe = d.jour < aujourdhui;
              const today = d.jour === aujourdhui;
              const h = (d.total / max) * H;
              return (
                <div
                  key={d.jour}
                  role="listitem"
                  aria-label={`${fmtLong.format(versDate(d.jour))} : ${d.total} rendez-vous`}
                  className="relative flex h-full flex-1 cursor-default items-end justify-center"
                  onMouseEnter={() => setSurvol(i)}
                  onMouseLeave={() => setSurvol(null)}
                >
                  {survol === i && <div className="absolute inset-0 rounded-md bg-encre/5" aria-hidden />}
                  <m.div
                    className="relative w-full max-w-7 rounded-t-[4px]"
                    style={{ background: passe ? SERIE_PASSE : SERIE, outline: today ? `2px solid ${SERIE}` : undefined, outlineOffset: 2 }}
                    initial={{ height: 0 }}
                    animate={{ height: Math.max(d.total ? h : 0, 0) }}
                    transition={{ duration: 0.6, delay: i * 0.02, ease: [0.22, 1, 0.36, 1] }}
                  />
                  {survol === i && (
                    <div className="pointer-events-none absolute bottom-full z-10 mb-2 w-max rounded-xl bg-encre px-3 py-2 text-xs text-white shadow-xl">
                      <p className="font-extrabold capitalize">{fmtLong.format(versDate(d.jour))}</p>
                      <p>{d.total} rendez-vous{d.annules ? ` · ${d.annules} annulé${d.annules > 1 ? "s" : ""}` : ""}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Axe X : une étiquette sur 3 + aujourd'hui */}
          <div className="mt-2 flex gap-[2px] text-[10px] font-bold" style={{ color: TEXTE_2 }} aria-hidden>
            {data.map((d, i) => (
              <span key={d.jour} className={`flex-1 text-center whitespace-nowrap ${d.jour === aujourdhui ? "font-extrabold text-encre" : ""}`}>
                {d.jour === aujourdhui ? "Auj." : i % 3 === 0 ? fmtJour.format(versDate(d.jour)) : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-4 flex flex-wrap gap-4 text-xs font-bold" style={{ color: TEXTE_2 }}>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm" style={{ background: SERIE_PASSE }} /> Jours passés</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm" style={{ background: SERIE }} /> Aujourd&apos;hui et à venir</span>
      </figcaption>
    </figure>
  );
}

/** Taux d'occupation des lits par service (barres horizontales, étiquettes directes). */
export function OccupationChart({ data }: { data: { nom: string; occupes: number; total: number }[] }) {
  const [survol, setSurvol] = useState<string | null>(null);
  return (
    <ul className="grid gap-3">
      {data.map((s, i) => {
        const pct = s.total ? Math.round((s.occupes / s.total) * 100) : 0;
        return (
          <li
            key={s.nom}
            className={`rounded-xl px-2 py-1 transition-colors ${survol === s.nom ? "bg-encre/5" : ""}`}
            onMouseEnter={() => setSurvol(s.nom)}
            onMouseLeave={() => setSurvol(null)}
          >
            <div className="flex justify-between gap-2 text-sm">
              <span className="truncate font-bold">{s.nom}</span>
              <span className="shrink-0 font-extrabold tabular-nums">
                {survol === s.nom ? `${s.occupes} / ${s.total} lits` : `${pct} %`}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full" style={{ background: GRILLE }}>
              <m.div
                className="h-full rounded-full"
                style={{ background: SERIE }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
