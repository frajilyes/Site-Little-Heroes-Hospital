import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MailCheck } from "lucide-react";
import { CODE_DURATION_MIN, getPendingLogin, getSession, resendCooldown } from "@/lib/auth";
import { VerificationForm } from "@/components/admin/VerificationForm";
import { Logo } from "@/components/site/Logo";
import { Trame } from "@/components/site/Decor";

export const metadata: Metadata = { title: "Verification — Staff Area", robots: { index: false } };

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
    <main className="relative grid flex-1 place-items-center overflow-hidden bg-marine px-4 py-16">
      <Trame className="opacity-70" />
      <div className="card animate-fade relative w-full max-w-md p-8 sm:p-10">
        <Logo />
        <div className="mt-8 grid size-12 place-items-center rounded-lg bg-azur/10 text-azur">
          <MailCheck className="size-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Two-step verification</h1>
        <p className="mt-2 text-sm leading-relaxed text-brume">
          An email with a 6-digit code has been sent to <strong className="text-encre">{masquerEmail(pending.email)}</strong>.
          It expires in {CODE_DURATION_MIN} minutes.
        </p>
        <VerificationForm cooldown={cooldown} />
      </div>
    </main>
  );
}
