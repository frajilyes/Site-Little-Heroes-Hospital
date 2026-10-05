"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { m } from "@/components/ui/motion";
import type { FormState } from "@/lib/types";

type Toast = { id: number; ok: boolean; message: string };

export function toast(state: Pick<FormState, "ok" | "message">) {
  window.dispatchEvent(new CustomEvent<Pick<FormState, "ok" | "message">>("ph-toast", { detail: state }));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    let id = 0;
    const on = (e: Event) => {
      const { ok, message } = (e as CustomEvent<Toast>).detail;
      const t = { id: ++id, ok, message };
      setToasts((list) => [...list, t]);
      setTimeout(() => setToasts((list) => list.filter((x) => x.id !== t.id)), 3200);
    };
    window.addEventListener("ph-toast", on);
    return () => window.removeEventListener("ph-toast", on);
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[70] grid gap-2" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <m.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60 }}
            className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-bold shadow-2xl ${t.ok ? "bg-encre text-white" : "bg-corail text-white"}`}
          >
            {t.ok ? <CheckCircle2 className="size-5 text-menthe" /> : <TriangleAlert className="size-5" />}
            {t.message}
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Bouton qui exécute une Server Action liée (`action.bind(null, id)`) et affiche un toast. */
export function ActionButton({
  action,
  children,
  className = "",
  confirmer,
  title,
}: {
  action: () => Promise<FormState>;
  children: ReactNode;
  className?: string;
  confirmer?: string;
  title?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={pending}
      onClick={() => {
        if (confirmer && !window.confirm(confirmer)) return;
        start(async () => {
          try {
            toast(await action());
          } catch {
            toast({ ok: false, message: "Action impossible, réessayez." });
          }
        });
      }}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition-all hover:-translate-y-0.5 disabled:opacity-50 ${className}`}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  );
}

/** Liste déroulante de statut qui appelle une Server Action à chaque changement. */
export function StatutSelect({
  action,
  value,
  options,
  className = "",
}: {
  action: (statut: string) => Promise<FormState>;
  value: string;
  options: Record<string, { label: string; cls: string }>;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const [courant, setCourant] = useState(value);
  // Resynchronise si le serveur renvoie une autre valeur
  const [prec, setPrec] = useState(value);
  if (value !== prec) {
    setPrec(value);
    setCourant(value);
  }
  return (
    <select
      value={courant}
      disabled={pending}
      aria-label="Statut"
      onChange={(e) => {
        const v = e.target.value;
        const ancien = courant;
        setCourant(v);
        start(async () => {
          const res = await action(v);
          if (!res.ok) setCourant(ancien);
          toast(res);
        });
      }}
      className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-extrabold disabled:opacity-60 ${options[courant]?.cls ?? ""} ${className}`}
    >
      {Object.entries(options).map(([k, o]) => (
        <option key={k} value={k}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
