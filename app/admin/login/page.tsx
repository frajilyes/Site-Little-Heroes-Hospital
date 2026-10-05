import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/site/Logo";
import { Blob, Clouds } from "@/components/site/Decor";

export const metadata: Metadata = { title: "Connexion — Espace personnel", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getSession()) redirect("/admin");
  const from = (await searchParams).from;
  return (
    <main className="relative grid flex-1 place-items-center overflow-hidden bg-gradient-to-br from-sky-200 via-violet-100 to-rose-100 px-4 py-16">
      <Clouds />
      <Blob className="-top-20 -left-20 size-96 bg-soleil/30" />
      <Blob className="-right-20 -bottom-20 size-96 bg-corail/20" />
      <div className="card relative w-full max-w-md animate-pop p-8 sm:p-10">
        <Logo />
        <h1 className="mt-8 text-3xl font-semibold">Espace personnel</h1>
        <p className="mt-1 text-brume">Réservé aux équipes de l&apos;hôpital.</p>
        <LoginForm from={typeof from === "string" ? from : ""} />
      </div>
    </main>
  );
}
