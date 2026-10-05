"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Download, Eraser, RotateCcw, Shuffle } from "lucide-react";
import { m } from "@/components/ui/motion";
import { Confetti } from "@/components/ui/Form";

/* ============================== Memory ============================== */

const EMOJIS = ["🦁", "🐼", "🦄", "🐙", "🦊", "🐸", "🐧", "🦖"];

type Carte = { id: number; emoji: string; trouvee: boolean };

function melanger(): Carte[] {
  const cartes = [...EMOJIS, ...EMOJIS].map((emoji, id) => ({ id, emoji, trouvee: false }));
  for (let i = cartes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cartes[i], cartes[j]] = [cartes[j], cartes[i]];
  }
  return cartes;
}

export function Memory() {
  // Mélange après le montage : le rendu serveur et le premier rendu client restent identiques
  const [cartes, setCartes] = useState<Carte[]>(() => [...EMOJIS, ...EMOJIS].map((emoji, id) => ({ id, emoji, trouvee: false })));
  const [retournees, setRetournees] = useState<number[]>([]);
  const [coups, setCoups] = useState(0);
  const [record, setRecord] = useState<number | null>(null);

  const nouvellePartie = useCallback(() => {
    setCartes(melanger());
    setRetournees([]);
    setCoups(0);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mélange aléatoire uniquement côté client
    nouvellePartie();
    try {
      const r = localStorage.getItem("memory-record");
      if (r) setRecord(Number(r));
    } catch {}
  }, [nouvellePartie]);

  const gagne = cartes.every((c) => c.trouvee);

  const retourner = (index: number) => {
    if (retournees.length === 2 || retournees.includes(index) || cartes[index].trouvee) return;
    const next = [...retournees, index];
    setRetournees(next);
    if (next.length < 2) return;

    const nbCoups = coups + 1;
    setCoups(nbCoups);
    const [a, b] = next;
    if (cartes[a].emoji === cartes[b].emoji) {
      const maj = cartes.map((c, i) => (i === a || i === b ? { ...c, trouvee: true } : c));
      setCartes(maj);
      setRetournees([]);
      if (maj.every((c) => c.trouvee) && (record === null || nbCoups < record)) {
        setRecord(nbCoups);
        try {
          localStorage.setItem("memory-record", String(nbCoups));
        } catch {}
      }
    } else {
      setTimeout(() => setRetournees([]), 800);
    }
  };

  return (
    <div className="card p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">🧠 Le Memory des animaux</h2>
          <p className="text-sm text-brume">Retrouve toutes les paires en un minimum de coups !</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-extrabold">
          <span className="rounded-full bg-creme px-3 py-1.5">Coups : {coups}</span>
          {record !== null && <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">🏆 Record : {record}</span>}
          <button type="button" onClick={nouvellePartie} className="btn bg-encre px-4 py-2 text-white">
            <Shuffle className="size-4" /> Rejouer
          </button>
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-md grid-cols-4 gap-2 sm:gap-3" style={{ perspective: 800 }}>
        {cartes.map((c, i) => {
          const visible = c.trouvee || retournees.includes(i);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => retourner(i)}
              aria-label={visible ? c.emoji : "Carte cachée"}
              className="relative aspect-square"
            >
              <m.span
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: visible ? 180 : 0, scale: c.trouvee ? [1, 1.12, 1] : 1 }}
                transition={{ duration: 0.45 }}
              >
                <span className="absolute inset-0 grid place-items-center rounded-2xl bg-gradient-to-br from-ciel to-lavande text-2xl text-white shadow-md [backface-visibility:hidden]">
                  ?
                </span>
                <span
                  className={`absolute inset-0 grid place-items-center rounded-2xl text-3xl shadow-md [backface-visibility:hidden] sm:text-4xl ${c.trouvee ? "bg-emerald-100" : "bg-white"}`}
                  style={{ transform: "rotateY(180deg)" }}
                >
                  {c.emoji}
                </span>
              </m.span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {gagne && coups > 0 && (
          <m.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mt-6 rounded-2xl bg-emerald-50 p-5 text-center">
            <Confetti />
            <p className="font-display text-2xl font-semibold text-emerald-700">Bravo, petit héros ! 🎉</p>
            <p className="text-sm font-bold text-emerald-700">Toutes les paires trouvées en {coups} coups.</p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================== Dessin ============================== */

const COULEURS_DESSIN = ["#1e2a4a", "#ff6b6b", "#ffc93c", "#3ccfa5", "#4aa8ff", "#9b8cff", "#ff9f43", "#ffffff"];

export function Dessin() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [couleur, setCouleur] = useState(COULEURS_DESSIN[1]);
  const [taille, setTaille] = useState(8);
  const dessine = useRef(false);
  const dernier = useRef<{ x: number; y: number } | null>(null);

  const effacer = useCallback(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cv.width, cv.height);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = cv.getBoundingClientRect();
    cv.width = width * ratio;
    cv.height = height * ratio;
    cv.getContext("2d")?.scale(ratio, ratio);
    effacer();
  }, [effacer]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const tracer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dessine.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const p = point(e);
    if (!ctx) return;
    ctx.strokeStyle = couleur;
    ctx.lineWidth = taille;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const from = dernier.current ?? p;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    dernier.current = p;
  };

  const telecharger = () => {
    const url = canvasRef.current?.toDataURL("image/png");
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "mon-dessin-petit-heros.png";
    a.click();
  };

  return (
    <div className="card p-5 sm:p-8">
      <h2 className="text-2xl font-semibold">🖍️ Dessine ton super-héros</h2>
      <p className="text-sm text-brume">Avec ton doigt ou ta souris. Tu pourras l&apos;offrir à ton docteur !</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {COULEURS_DESSIN.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCouleur(c)}
            aria-label={`Couleur ${c}`}
            aria-pressed={couleur === c}
            className={`size-9 rounded-full border-2 border-black/10 transition-transform ${couleur === c ? "scale-125 ring-4 ring-black/10" : "hover:scale-110"}`}
            style={{ background: c }}
          />
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm font-bold">
          Taille
          <input type="range" min={2} max={30} value={taille} onChange={(e) => setTaille(Number(e.target.value))} className="accent-corail" />
        </label>
      </div>
      <canvas
        ref={canvasRef}
        className="mt-4 h-80 w-full cursor-crosshair touch-none rounded-2xl border-4 border-dashed border-[#f1ebe2] bg-white"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dessine.current = true;
          dernier.current = point(e);
          tracer(e);
        }}
        onPointerMove={tracer}
        onPointerUp={() => {
          dessine.current = false;
          dernier.current = null;
        }}
        onPointerLeave={() => {
          dessine.current = false;
          dernier.current = null;
        }}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={effacer} className="btn bg-creme text-encre">
          <Eraser className="size-4" /> Tout effacer
        </button>
        <button type="button" onClick={telecharger} className="btn bg-encre text-white">
          <Download className="size-4" /> Enregistrer
        </button>
      </div>
    </div>
  );
}

/* ============================== Blagues ============================== */

const BLAGUES = [
  ["Pourquoi les plongeurs plongent-ils toujours en arrière ?", "Parce que sinon ils tombent dans le bateau ! 🤿"],
  ["Que dit un docteur à un squelette ?", "Tu es venu trop tard, il ne reste que les os ! 💀"],
  ["Quel est le comble pour un médecin ?", "D'avoir un patient… impatient ! ⏳"],
  ["Pourquoi le livre de maths est-il triste ?", "Parce qu'il a trop de problèmes ! 📘"],
  ["Qu'est-ce qui est jaune et qui attend ?", "Jonathan ! 🍋"],
  ["Comment appelle-t-on un chat tombé dans un pot de peinture le jour de Noël ?", "Un chat-peint de Noël ! 🎄"],
  ["Pourquoi les poissons détestent l'ordinateur ?", "À cause du net ! 🐟"],
  ["Que fait une fraise sur un cheval ?", "Tagada tagada ! 🍓"],
];

export function Blagues() {
  const [i, setI] = useState(0);
  const [revele, setRevele] = useState(false);
  const [q, r] = BLAGUES[i];
  return (
    <div className="card relative overflow-hidden bg-gradient-to-br from-amber-100 to-rose-100 p-6 sm:p-8">
      <h2 className="text-2xl font-semibold">😂 La blague du docteur</h2>
      <AnimatePresence mode="wait">
        <m.div key={i} initial={{ opacity: 0, rotateX: -60 }} animate={{ opacity: 1, rotateX: 0 }} exit={{ opacity: 0, rotateX: 60 }} className="mt-4 min-h-28">
          <p className="font-display text-xl font-semibold">{q}</p>
          <AnimatePresence>
            {revele && (
              <m.p initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="mt-3 text-lg font-bold text-corail">
                {r}
              </m.p>
            )}
          </AnimatePresence>
        </m.div>
      </AnimatePresence>
      <div className="mt-4 flex flex-wrap gap-2">
        {!revele ? (
          <button type="button" onClick={() => setRevele(true)} className="btn bg-corail text-white">
            Voir la réponse
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setRevele(false);
              setI((i + 1) % BLAGUES.length);
            }}
            className="btn bg-encre text-white"
          >
            <RotateCcw className="size-4" /> Une autre !
          </button>
        )}
      </div>
    </div>
  );
}
