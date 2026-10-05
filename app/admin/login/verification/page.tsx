import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MailCheck } from "lucide-react";
import { CODE_DURATION_MIN, getPendingLogin, getSession, resendCooldown } from "@/lib/auth";
import { VerificationForm } from "@/components/admin/VerificationForm";
import { Logo } from "@/components/site/Logo";
import { Blob, Clouds } from "@/components/site/Decor";

export const metadata: Metadata = { title: "Vérification — Espace personnel", robots: { index: false } };

/** a••••n@petitsheros.fr */
function masquerEmail(email: string) {
  const [local, domaine] = email.split("@");
  const visible = local.length <= 2 ? local[0] : `${local[0]}${"•".repeat(Math.min(local.length - 2, 6))}${local.at(-1)}`;
  return `${visible}@${domaine}`;
}

export default async function VerificationPage() {
  if (await getSession()) redirect("/admin");
  const pending = await getPendingLogin();
  if (!pending) redirect("/admin/login");
  const cooldown = await resendCooldown(pending.id);

  return (
    <main className="relative grid flex-1 place-items-center overflow-hidden bg-gradient-to-br from-sky-200 via-violet-100 to-rose-100 px-4 py-16">
      <Clouds />
      <Blob className="-top-20 -left-20 size-96 bg-soleil/30" />
      <Blob className="-right-20 -bottom-20 size-96 bg-corail/20" />
      <div className="card relative w-full max-w-md animate-pop p-8 sm:p-10">
        <Logo />
        <div className="mt-8 grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <MailCheck className="size-7" />
        </div>
        <h1 className="mt-4 text-3xl font-semibold">Validation en deux étapes</h1>
        <p className="mt-2 text-brume">
          Un e-mail contenant un code à 6 chiffres a été envoyé à <strong className="text-encre">{masquerEmail(pending.email)}</strong>.
          Il expire dans {CODE_DURATION_MIN} minutes.
        </p>
        <VerificationForm cooldown={cooldown} />
      </div>
    </main>
  );
}
