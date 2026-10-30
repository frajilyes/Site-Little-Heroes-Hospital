"use client";

import { m } from "@/components/ui/motion";

// Fade between pages (template is remounted on every navigation).
// Opacity only: a transform would break the "fixed" positioning of modals.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col"
    >
      {children}
    </m.div>
  );
}
