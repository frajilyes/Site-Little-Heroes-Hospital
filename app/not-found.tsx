import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, Phone } from "lucide-react";

export default async function NotFound() {
  // Rendered per request so the CSP nonce exists (see proxy.ts). This page answers every
  // unmatched URL, so it is the one the strict policy would most visibly break.
  await connection();
  return (
    <main className="grid flex-1 place-items-center px-4 py-28">
      <div className="max-w-lg text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-3 text-4xl font-bold text-balance">This page does not exist</h1>
        <p className="mt-3 leading-relaxed text-brume">
          The address you entered is incorrect, or the page has moved. You can go back to the
          homepage or contact the switchboard if you were looking for specific information.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primaire">
            <ArrowLeft className="size-4" /> Back to home
          </Link>
          <a href="tel:0123456700" className="btn btn-secondaire">
            <Phone className="size-4" /> 01 23 45 67 00
          </a>
        </div>
      </div>
    </main>
  );
}
