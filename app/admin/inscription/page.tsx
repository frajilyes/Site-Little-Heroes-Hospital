import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { getSession, inscriptionOuverte } from "@/lib/auth";
import { InscriptionForm } from "@/components/admin/InscriptionForm";
import { Logo } from "@/components/site/Logo";
import { Trame } from "@/components/site/Decor";

export const metadata: Metadata = { title: "Registration — Staff Area", robots: { index: false } };

/**
 * Creation of the very first staff account, and nothing more.
 *
 * The closed case is rendered rather than redirected: someone who kept this page open
 * while the account was created elsewhere is told what happened instead of landing on a
 * login form with no explanation. The form itself re-checks, so the page is only ever
 * cosmetic — see `inscription()` in app/actions/admin.ts.
 */
export default async function InscriptionPage() {
  if (await getSession()) redirect("/admin");
  const ouverte = await inscriptionOuverte();

  return (
    <main className="relative grid flex-1 place-items-center overflow-hidden bg-marine px-4 py-16">
      <Trame className="opacity-70" />
      <div className="card animate-fade relative w-full max-w-md p-8 sm:p-10">
        <Logo />
        {ouverte ? (
          <>
            <h1 className="mt-8 text-2xl font-bold">First staff account</h1>
            <p className="mt-1.5 text-sm text-brume">
              No account exists yet. The one created here opens the whole staff area: use a real
              address, a verification code is sent to it right away.
            </p>
            <InscriptionForm />
          </>
        ) : (
          <>
            <div className="mt-8 grid size-12 place-items-center rounded-lg bg-corail/10 text-corail">
              <LockKeyhole className="size-6" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Registration closed</h1>
            <p className="mt-2 text-sm leading-relaxed text-brume">
              A staff account already exists, so this form is closed. Further accounts are added by
              the hospital IT department, directly in the database.
            </p>
            <Link href="/admin/login" className="btn btn-primaire mt-6 w-full">
              Back to login
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
