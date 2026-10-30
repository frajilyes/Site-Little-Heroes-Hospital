import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*
        Keyboard shortcut past the header. Revealed on :focus-visible, not :focus — a plain :focus
        also matches a click or a focus the browser restores on load, which pops the box over the
        top-left corner of the page for a visitor who never asked for it.
      */}
      <a
        href="#contenu"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-xl focus-visible:bg-white focus-visible:px-4 focus-visible:py-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
