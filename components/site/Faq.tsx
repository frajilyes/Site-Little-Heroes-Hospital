"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { m } from "@/components/ui/motion";

export function Faq({ items }: { items: { q: string; r: string }[] }) {
  const [ouvert, setOuvert] = useState<number | null>(0);
  return (
    <div className="grid gap-3">
      {items.map((it, i) => {
        const actif = ouvert === i;
        return (
          <div key={it.q} className={`card overflow-hidden transition-shadow ${actif ? "shadow-xl" : ""}`}>
            <h3>
              <button
                type="button"
                onClick={() => setOuvert(actif ? null : i)}
                aria-expanded={actif}
                aria-controls={`faq-${i}`}
                className="flex w-full items-center justify-between gap-4 p-5 text-left font-display text-lg font-semibold"
              >
                {it.q}
                <m.span
                  animate={{ rotate: actif ? 45 : 0, backgroundColor: actif ? "#ff6b6b" : "#fff8ef" }}
                  className={`grid size-9 shrink-0 place-items-center rounded-full ${actif ? "text-white" : "text-encre"}`}
                >
                  <Plus className="size-5" />
                </m.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {actif && (
                <m.div
                  id={`faq-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="px-5 pb-5 text-brume">{it.r}</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
