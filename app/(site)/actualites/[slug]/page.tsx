import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getActualite, getActualites } from "@/lib/data";
import { COULEURS } from "@/lib/theme";
import { dateLongue } from "@/lib/format";
import { ActuCard } from "@/components/site/Cards";
import { Clouds } from "@/components/site/Decor";
import { Reveal } from "@/components/ui/motion";

export async function generateMetadata({ params }: PageProps<"/actualites/[slug]">): Promise<Metadata> {
  const actu = await getActualite((await params).slug);
  return actu ? { title: actu.titre, description: actu.resume } : { title: "Article introuvable" };
}

export default async function ArticlePage({ params }: PageProps<"/actualites/[slug]">) {
  const { slug } = await params;
  const [actu, toutes] = await Promise.all([getActualite(slug), getActualites(4)]);
  if (!actu) notFound();
  const c = COULEURS[actu.couleur];
  const suggestions = toutes.filter((a) => a.id !== actu.id).slice(0, 3);
  const minutes = Math.max(1, Math.round(actu.contenu.split(/\s+/).length / 200));

  return (
    <>
      <section className={`relative -mt-[76px] overflow-hidden bg-gradient-to-br pt-[76px] ${c.grad}`}>
        <Clouds />
        <div className="relative mx-auto max-w-3xl px-4 pt-10 pb-24 text-center text-white">
          <Link href="/actualites" className="inline-flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/30">
            <ArrowLeft className="size-4" /> Toutes les actualités
          </Link>
          <div className="mt-8 animate-pop text-8xl">{actu.emoji}</div>
          <p className="mt-6 text-sm font-extrabold tracking-widest uppercase opacity-90">
            {actu.categorie} · {dateLongue(actu.date_pub)} · {minutes} min de lecture
          </p>
          <h1 className="mt-3 animate-rise text-4xl font-semibold text-balance sm:text-5xl">{actu.titre}</h1>
        </div>
      </section>
      <article className="mx-auto -mt-12 max-w-3xl px-4">
        <Reveal className="card p-8 sm:p-12">
          <p className={`text-lg font-bold ${c.text}`}>{actu.resume}</p>
          <div className="mt-6 grid gap-5 leading-relaxed text-encre/90">
            {actu.contenu.split(/\n\s*\n/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>
      </article>
      {suggestions.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16">
          <h2 className="text-2xl font-semibold">À lire aussi</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {suggestions.map((a) => (
              <ActuCard key={a.id} actu={a} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
