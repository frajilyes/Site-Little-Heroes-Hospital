"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid flex-1 place-items-center px-4 py-24 text-center">
      <div className="max-w-lg">
        <div className="animate-wiggle text-7xl">🤒</div>
        <h1 className="mt-6 text-4xl font-semibold">Oups, petit bobo technique !</h1>
        <p className="mt-3 text-brume">
          La page n&apos;a pas pu être chargée. Si vous êtes l&apos;administrateur, vérifiez que MySQL est démarré et que
          les identifiants de <code className="rounded bg-white px-1.5 py-0.5 text-sm">.env.local</code> sont corrects
          (puis lancez <code className="rounded bg-white px-1.5 py-0.5 text-sm">npm run db:setup</code>).
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn bg-corail text-white">
            <RotateCcw className="size-4" /> Réessayer
          </button>
          <Link href="/" className="btn bg-white text-encre shadow-sm">
            Accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
