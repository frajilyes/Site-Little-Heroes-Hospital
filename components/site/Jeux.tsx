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
  // Shuffle after mount: server render and first client render stay identical
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- random shuffle, client-side only
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
          <h2 className="text-2xl font-semibold">🧠 Animal Memory</h2>
          <p className="text-sm text-brume">Find all the pairs in as few tries as possible!</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="rounded-full bg-creme px-3 py-1.5">Tries: {coups}</span>
          {record !== null && <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">🏆 Best: {record}</span>}
          <button type="button" onClick={nouvellePartie} className="btn btn-primaire px-4 py-2">
            <Shuffle className="size-4" /> Play again
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
              aria-label={visible ? c.emoji : "Hidden card"}
              className="relative aspect-square"
            >
              <m.span
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: visible ? 180 : 0, scale: c.trouvee ? [1, 1.12, 1] : 1 }}
                transition={{ duration: 0.45 }}
              >
                <span className="absolute inset-0 grid place-items-center rounded-lg bg-linear-to-br from-ciel to-lavande text-2xl text-white shadow-md [backface-visibility:hidden]">
                  ?
                </span>
                <span
                  className={`absolute inset-0 grid place-items-center rounded-lg text-3xl shadow-md [backface-visibility:hidden] sm:text-4xl ${c.trouvee ? "bg-emerald-100" : "bg-white"}`}
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
          <m.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mt-6 rounded-lg bg-emerald-50 p-5 text-center">
            <Confetti />
            <p className="font-display text-2xl font-semibold text-emerald-700">Well done, little hero! 🎉</p>
            <p className="text-sm font-bold text-emerald-700">All pairs found in {coups} tries.</p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================== Drawing ============================== */

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
    a.download = "my-superhero-drawing.png";
    a.click();
  };

  return (
    <div className="card p-5 sm:p-8">
      <h2 className="text-2xl font-semibold">🖍️ Draw your superhero</h2>
      <p className="text-sm text-brume">With your finger or your mouse. You can give it to your doctor!</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {COULEURS_DESSIN.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCouleur(c)}
            aria-label={`Color ${c}`}
            aria-pressed={couleur === c}
            className={`size-9 rounded-full border-2 border-black/10 transition-transform ${couleur === c ? "scale-125 ring-4 ring-black/10" : "hover:scale-110"}`}
            style={{ background: c }}
          />
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm font-bold">
          Size
          <input type="range" min={2} max={30} value={taille} onChange={(e) => setTaille(Number(e.target.value))} className="accent-corail" />
        </label>
      </div>
      <canvas
        ref={canvasRef}
        className="mt-4 h-80 w-full cursor-crosshair touch-none rounded-lg border-4 border-dashed border-bord bg-white"
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
        <button type="button" onClick={effacer} className="btn btn-secondaire">
          <Eraser className="size-4" /> Clear all
        </button>
        <button type="button" onClick={telecharger} className="btn btn-primaire">
          <Download className="size-4" /> Save
        </button>
      </div>
    </div>
  );
}

/* ============================== Jokes ============================== */

const BLAGUES = [
  ["Why don't skeletons fight each other?", "They don't have the guts! 💀"],
  ["What did the doctor say to the broken glass?", "Take it easy, don't cut yourself! 🏥"],
  ["What's the difference between a nurse and a nagging wife?", "The nurse only pokes you with a needle once! ⏳"],
  ["Why was the math book sad?", "Because it had too many problems! 📘"],
  ["What do you call a fish with no eyes?", "A fsh! 🐟"],
  ["What do you call a cat that fell into a paint can on Christmas Day?", "A Christmas-painted cat! 🎄"],
  ["Why don't fish like going on the computer?", "They're afraid of the net! 🐠"],
  ["What does a strawberry say when it rides a horse?", "Tagada tagada! 🍓"],
];

export function Blagues() {
  const [i, setI] = useState(0);
  const [revele, setRevele] = useState(false);
  const [q, r] = BLAGUES[i];
  return (
    <div className="card relative overflow-hidden bg-linear-to-br from-amber-100 to-rose-100 p-6 sm:p-8">
      <h2 className="text-2xl font-semibold">😂 The doctor’s joke</h2>
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
          <button type="button" onClick={() => setRevele(true)} className="btn btn-primaire">
            See the answer
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setRevele(false);
              setI((i + 1) % BLAGUES.length);
            }}
            className="btn btn-primaire"
          >
            <RotateCcw className="size-4" /> Another one!
          </button>
        )}
      </div>
    </div>
  );
}
