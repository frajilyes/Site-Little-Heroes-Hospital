import Link from "next/link";
import { Balloon, Clouds } from "@/components/site/Decor";

export default function NotFound() {
  return (
    <main className="relative grid flex-1 place-items-center overflow-hidden bg-gradient-to-b from-sky-200 to-creme px-4 py-24 text-center">
      <Clouds />
      <Balloon color="#ff6b6b" className="absolute top-20 left-[15%] w-12" />
      <Balloon color="#ffc93c" className="absolute right-[15%] bottom-24 w-10" delay="-2s" />
      <div className="relative">
        <p className="font-display text-[8rem] leading-none font-semibold text-white drop-shadow-[0_6px_0_rgb(30_42_74/0.15)] sm:text-[11rem]">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Cette page s&apos;est envolée !</h1>
        <p className="mt-2 text-brume">Comme un ballon… Elle n&apos;existe pas ou a été déplacée.</p>
        <Link href="/" className="btn mt-8 bg-corail text-white shadow-lg shadow-corail/30">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
