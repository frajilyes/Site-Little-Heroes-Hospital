"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, TriangleAlert, X } from "lucide-react";
import { m } from "./motion";
import type { FormState } from "@/lib/types";

export const ETAT_INITIAL: FormState = { ok: false, message: "" };

export function Field({
  label,
  name,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-extrabold text-encre">
        {label}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <m.p
            key="err"
            id={`${name}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-xs font-bold text-corail"
          >
            {error}
          </m.p>
        ) : hint ? (
          <p className="mt-1 text-xs text-brume">{hint}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Props communes à un input lié à l'état d'une action : valeur par défaut et accessibilité des erreurs. */
export function bind(state: FormState, name: string) {
  return {
    id: name,
    name,
    defaultValue: state.data?.[name] ?? "",
    "aria-invalid": state.errors?.[name] ? true : undefined,
    "aria-describedby": state.errors?.[name] ? `${name}-error` : undefined,
  } as const;
}

export function SubmitButton({ pending, children, className = "" }: { pending: boolean; children: ReactNode; className?: string }) {
  return (
    <button type="submit" disabled={pending} className={`btn bg-corail text-white shadow-lg shadow-corail/30 ${className}`}>
      {pending ? <Loader2 className="size-5 animate-spin" /> : null}
      {pending ? "Envoi en cours…" : children}
    </button>
  );
}

export function FormAlert({ state }: { state: FormState }) {
  return (
    <AnimatePresence mode="wait">
      {state.message && (
        <m.div
          key={state.message}
          role={state.ok ? "status" : "alert"}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-bold ${
            state.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"
          }`}
        >
          {state.ok ? <CheckCircle2 className="size-5 shrink-0" /> : <TriangleAlert className="size-5 shrink-0" />}
          {state.message}
        </m.div>
      )}
    </AnimatePresence>
  );
}

/** Modale accessible rendue dans <body> (Échap pour fermer, focus initial, défilement bloqué). */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus(), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-50 grid place-items-end bg-encre/50 backdrop-blur-sm sm:place-items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <m.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-[2rem] sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-creme transition-transform hover:rotate-90"
              aria-label="Fermer"
            >
              <X className="size-5" />
            </button>
            {children}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Pluie de confettis (célébration après une réservation / un don). */
export function Confetti() {
  const couleurs = ["#ff6b6b", "#ffc93c", "#3ccfa5", "#4aa8ff", "#9b8cff"];
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {Array.from({ length: 60 }).map((_, i) => {
        const left = (i * 37) % 100;
        const delay = (i % 10) * 0.08;
        const size = 6 + (i % 4) * 3;
        return (
          <m.span
            key={i}
            className="absolute top-0 block rounded-sm"
            style={{ left: `${left}%`, width: size, height: size * 0.6, background: couleurs[i % couleurs.length] }}
            initial={{ y: -40, rotate: 0, opacity: 1 }}
            animate={{ y: "105vh", rotate: 360 * (i % 2 ? 2 : -2), x: (i % 7) * 12 - 36, opacity: [1, 1, 0] }}
            transition={{ duration: 2.4 + (i % 5) * 0.3, delay, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}
