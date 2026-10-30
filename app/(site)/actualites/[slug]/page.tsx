import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getActualite, getActualites } from "@/lib/data";
import { dateLongue } from "@/lib/format";
import { ACTUALITE_PAR_DEFAUT, src } from "@/lib/images";
import { ActuCard } from "@/components/site/Cards";
import { Reveal } from "@/components/ui/motion";

export async function generateMetadata({ params }: PageProps<"/actualites/[slug]">): Promise<Metadata> {
  const actu = await getActualite((await params).slug);
  return actu ? { title: actu.titre, description: actu.resume } : { title: "Article not found" };
}

export default async function ArticlePage({ params }: PageProps<"/actualites/[slug]">) {
  const { slug } = await params;
  const [actu, toutes] = await Promise.all([getActualite(slug), getActualites(4)]);
  if (!actu) notFound();
  const suggestions = toutes.filter((a) => a.id !== actu.id).slice(0, 3);
  const minutes = Math.max(1, Math.round(actu.contenu.split(/\s+/).length / 200));

  return (
    <>
      <section className="relative isolate overflow-hidden bg-marine">
        <Image
          src={src(actu.image, ACTUALITE_PAR_DEFAUT, 1800)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-t from-marine via-marine/90 to-marine/60" />
        <div className="relative mx-auto max-w-3xl px-4 pt-10 pb-24">
          <Link
            href="/actualites"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" /> All news
          </Link>
          <p className="mt-10 text-[13px] font-semibold tracking-wide text-ciel uppercase">
            {actu.categorie} · {dateLongue(actu.date_pub)} · {minutes} min read
          </p>
          <h1 className="animate-rise mt-3 text-4xl font-bold text-balance text-white sm:text-5xl">{actu.titre}</h1>
        </div>
      </section>

      <article className="mx-auto -mt-12 max-w-3xl px-4">
        <Reveal className="card p-8 sm:p-12">
          <p className="border-l-2 border-azur pl-4 text-lg leading-relaxed font-medium text-encre">{actu.resume}</p>
          <div className="mt-7 grid gap-5 leading-relaxed text-encre/85">
            {actu.contenu.split(/\n\s*\n/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>
      </article>

      {suggestions.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16">
          <h2 className="text-2xl font-bold">Also worth reading</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {suggestions.map((a) => (
              <ActuCard key={a.id} actu={a} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
