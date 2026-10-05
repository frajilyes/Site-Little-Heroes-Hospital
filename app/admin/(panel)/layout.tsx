import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { Sidebar } from "@/components/admin/Sidebar";
import { Toaster } from "@/components/admin/Toaster";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Administration" },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const badges = (await queryOne<{ rdv: number; msg: number }>(
    `SELECT (SELECT COUNT(*) FROM rendez_vous WHERE statut = 'en_attente') AS rdv,
            (SELECT COUNT(*) FROM messages WHERE lu = 0) AS msg`,
  ))!;

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f2ec] lg:flex-row">
      <Sidebar nom={session.nom} badges={badges} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
      <Toaster />
    </div>
  );
}
