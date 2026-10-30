import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, inscriptionOuverte } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/site/Logo";
import { Trame } from "@/components/site/Decor";

export const metadata: Metadata = { title: "Login — Staff Area", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getSession()) redirect("/admin");
  const from = (await searchParams).from;
  // Shown only on an installation that has no staff account yet: see /admin/inscription.
  const inscription = await inscriptionOuverte();
  return (
    <main className="relative grid flex-1 place-items-center overflow-hidden bg-marine px-4 py-16">
      <Trame className="opacity-70" />
      <div className="card animate-fade relative w-full max-w-md p-8 sm:p-10">
        <Logo />
        <h1 className="mt-8 text-2xl font-bold">Staff Area</h1>
        <p className="mt-1.5 text-sm text-brume">
          Access restricted to authorized hospital staff.
        </p>
        <LoginForm from={typeof from === "string" ? from : ""} />
        {inscription ? (
          <p className="mt-6 border-t border-bord pt-5 text-center text-sm text-brume">
            No account exists yet.{" "}
            <Link href="/admin/inscription" className="font-bold text-corail hover:underline">
              Create the first one
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
