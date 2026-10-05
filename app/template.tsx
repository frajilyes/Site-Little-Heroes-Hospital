"use client";

import { m } from "@/components/ui/motion";

// Fondu entre les pages (template est remonté à chaque navigation).
// Opacité uniquement : un transform casserait le positionnement « fixed » des modales.
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
