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
          <div key={it.q} className={`card overflow-hidden ${actif ? "border-azur/35" : ""}`}>
            <h3>
              <button
                type="button"
                onClick={() => setOuvert(actif ? null : i)}
                aria-expanded={actif}
                aria-controls={`faq-${i}`}
                className="flex w-full items-center justify-between gap-4 p-5 text-left font-display text-[17px] font-bold"
              >
                {it.q}
                <m.span
                  animate={{ rotate: actif ? 45 : 0, backgroundColor: actif ? "#1668b3" : "#eef3f8" }}
                  className={`grid size-8 shrink-0 place-items-center rounded-lg ${actif ? "text-white" : "text-brume"}`}
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
                  <p className="px-5 pb-5 text-sm leading-relaxed text-brume">{it.r}</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
