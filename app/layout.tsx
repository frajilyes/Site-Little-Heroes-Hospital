import type { Metadata, Viewport } from "next";
import { MotionProvider } from "@/components/ui/motion";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hôpital des Petits Héros — Hôpital pédiatrique",
    template: "%s · Hôpital des Petits Héros",
  },
  description:
    "Hôpital pédiatrique : urgences 24h/24, 8 services spécialisés, activités pour les enfants hospitalisés, prise de rendez-vous en ligne.",
  keywords: ["hôpital pédiatrique", "urgences enfants", "pédiatre", "rendez-vous", "activités enfants hospitalisés"],
};

export const viewport: Viewport = {
  themeColor: "#fff8ef",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
