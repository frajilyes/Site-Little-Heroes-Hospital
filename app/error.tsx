"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid flex-1 place-items-center px-4 py-24 text-center">
      <div className="max-w-lg">
        <span className="inline-grid size-12 place-items-center rounded-xl bg-corail/10 text-corail">
          <AlertTriangle className="size-6" />
        </span>
        <h1 className="mt-5 text-3xl font-bold">Something went wrong</h1>
        <p className="mt-3 leading-relaxed text-brume">
          The page could not be loaded. Please try again in a moment, or call the switchboard on
          01 23 45 67 00 if you need something right away.
        </p>
        {/*
          Which database failed and how to restart it is for whoever runs the app locally.
          On a deployed site the same paragraph tells a stranger what to aim at and which
          file holds the credentials, on a page any error can reach. NODE_ENV is inlined at
          build time, so this block is not even in the production bundle.
        */}
        {process.env.NODE_ENV !== "production" && (
          <p className="mt-3 text-sm text-brume">
            Check that MySQL is running and that the credentials in{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-sm">.env</code> are correct, then run{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-sm">npm run db:setup</code>.
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primaire">
            <RotateCcw className="size-4" /> Try again
          </button>
          <Link href="/" className="btn btn-secondaire">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
