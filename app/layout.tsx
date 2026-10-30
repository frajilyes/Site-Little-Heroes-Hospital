import type { Metadata, Viewport } from "next";
import { MotionProvider } from "@/components/ui/motion";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Little Heroes Hospital — Pediatric Hospital",
    template: "%s · Little Heroes Hospital",
  },
  description:
    "Pediatric hospital: 24/7 emergency care, specialized departments, activities for hospitalized children, online appointment booking.",
  keywords: ["pediatric hospital", "children's emergency", "pediatrician", "appointment", "activities for hospitalized children"],
};

export const viewport: Viewport = {
  themeColor: "#0a2f58",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
