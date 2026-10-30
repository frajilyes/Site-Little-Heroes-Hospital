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
            className={`flex items-center gap-3 rounded-lg px-5 py-3.5 text-sm font-bold shadow-2xl ${t.ok ? "bg-marine text-white" : "bg-corail text-white"}`}
          >
            {t.ok ? <CheckCircle2 className="size-5 text-menthe" /> : <TriangleAlert className="size-5" />}
            {t.message}
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Button that runs a bound Server Action (`action.bind(null, id)`) and shows a toast. */
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
            toast({ ok: false, message: "Action failed, please try again." });
          }
        });
      }}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50 ${className}`}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  );
}

/** Status dropdown that calls a Server Action on every change. */
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
  // Resync if the server returns a different value
  const [prec, setPrec] = useState(value);
  if (value !== prec) {
    setPrec(value);
    setCourant(value);
  }
  return (
    <select
      value={courant}
      disabled={pending}
      aria-label="Status"
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
      className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-bold disabled:opacity-60 ${options[courant]?.cls ?? ""} ${className}`}
    >
      {Object.entries(options).map(([k, o]) => (
        <option key={k} value={k}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
