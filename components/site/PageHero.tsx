import { Blob, Clouds, Star } from "./Decor";

type Props = {
  titre: string;
  sousTitre: string;
  emoji: string;
  badge?: string;
  ton?: "ciel" | "corail" | "menthe" | "lavande" | "soleil";
  children?: React.ReactNode;
};

const TONS = {
  ciel: "from-sky-200 via-sky-100 to-creme",
  corail: "from-rose-200 via-orange-100 to-creme",
  menthe: "from-emerald-200 via-teal-100 to-creme",
  lavande: "from-violet-200 via-indigo-100 to-creme",
  soleil: "from-amber-200 via-yellow-100 to-creme",
};

/** En-tête coloré et animé des pages intérieures. */
export function PageHero({ titre, sousTitre, emoji, badge, ton = "ciel", children }: Props) {
  return (
    <section className={`relative -mt-[76px] overflow-hidden bg-gradient-to-b pt-[76px] ${TONS[ton]}`}>
      <Clouds />
      <Blob className="-top-20 -right-20 size-72 bg-white/50" />
      <Star className="absolute top-28 left-[8%] size-6 animate-spin-slow opacity-80" />
      <Star className="absolute right-[12%] bottom-10 size-4 animate-wiggle" color="#ff6b6b" />
      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-16 text-center sm:pt-20 sm:pb-20">
        <div className="mx-auto mb-5 grid size-20 animate-pop place-items-center rounded-[1.75rem] bg-white text-4xl shadow-xl shadow-black/5">
          <span className="animate-wiggle inline-block">{emoji}</span>
        </div>
        {badge && (
          <p className="mx-auto mb-3 inline-block rounded-full bg-white/70 px-4 py-1 text-xs font-extrabold tracking-wider text-brume uppercase backdrop-blur">
            {badge}
          </p>
        )}
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold text-balance text-encre sm:text-5xl lg:text-6xl">{titre}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-pretty text-brume">{sousTitre}</p>
        {children}
      </div>
    </section>
  );
}

export function SectionTitle({ kicker, titre, texte, center = true }: { kicker: string; titre: string; texte?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="font-display text-sm font-semibold tracking-widest text-corail uppercase">{kicker}</p>
      <h2 className="mt-2 text-3xl font-semibold text-balance sm:text-4xl">{titre}</h2>
      {texte && <p className="mt-3 text-pretty text-brume">{texte}</p>}
    </div>
  );
}
