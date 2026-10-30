import Image from "next/image";
import { photo as photoUrl } from "@/lib/images";
import { ServiceIcon } from "@/components/ui/Icon";
import { Trame, VoilePhoto } from "./Decor";

type Props = {
  titre: string;
  sousTitre: string;
  /** Unsplash id of the background photo (see lib/images.ts). */
  photo: string;
  /** Lucide icon name shown in the badge (see components/ui/Icon.tsx). */
  icone?: string;
  badge?: string;
  children?: React.ReactNode;
};

/** Photographic header for interior pages. */
export function PageHero({ titre, sousTitre, photo, icone, badge, children }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-marine">
      <Image
        src={photoUrl(photo, 1800)}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-55"
      />
      <VoilePhoto />
      <Trame className="opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-20">
        <div className="max-w-2xl">
          {icone && (
            <span className="mb-5 inline-grid size-12 place-items-center rounded-xl bg-white/12 ring-1 ring-white/25 backdrop-blur-sm">
              <ServiceIcon name={icone} className="size-6 text-white" />
            </span>
          )}
          {badge && (
            <p className="mb-3 inline-block rounded-full bg-white/12 px-3 py-1 text-xs font-semibold tracking-wide text-white/90 uppercase ring-1 ring-white/20">
              {badge}
            </p>
          )}
          <h1 className="animate-rise text-4xl font-bold text-balance text-white sm:text-5xl">{titre}</h1>
          <p className="animate-rise mt-4 text-lg text-pretty text-white/80" style={{ animationDelay: "0.1s" }}>
            {sousTitre}
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}

export function SectionTitle({
  kicker,
  titre,
  texte,
  center = true,
}: {
  kicker: string;
  titre: string;
  texte?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{kicker}</p>
      <h2 className="mt-2.5 text-3xl font-bold text-balance sm:text-[2.1rem]">{titre}</h2>
      {texte && <p className="mt-3 text-pretty text-brume">{texte}</p>}
    </div>
  );
}
