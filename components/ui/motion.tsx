"use client";

import { LazyMotion, MotionConfig, domMax, useInView, animate } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, type ReactNode } from "react";

/** Charge uniquement les fonctionnalités d'animation utilisées (bundle allégé) et respecte « réduire les animations ». */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  as?: "div" | "section" | "li" | "article";
};

/** Apparition douce au défilement. */
export function Reveal({ children, className, delay = 0, y = 28, x = 0, as = "div" }: RevealProps) {
  const Comp = m[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

/** Conteneur dont les enfants <StaggerItem> apparaissent en cascade. */
export function Stagger({ children, className, gap = 0.08 }: { children: ReactNode; className?: string; gap?: number }) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.96 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 24 } },
      }}
    >
      {children}
    </m.div>
  );
}

/** Compteur animé de 0 à `value` quand il devient visible. */
export function CountUp({ value, suffix = "", duration = 1.8 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const fmt = new Intl.NumberFormat("fr-FR");
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (el.textContent = fmt.format(Math.round(v)) + suffix),
    });
    return () => controls.stop();
  }, [inView, value, suffix, duration]);
  return <span ref={ref}>0{suffix}</span>;
}

type AppearProps = {
  children?: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  spring?: boolean;
  as?: "div" | "p" | "h1" | "ul" | "span";
};

/** Apparition au montage (utilisable depuis un Server Component, contrairement à `m.*`). */
export function Appear({ children, className, delay = 0, y = 20, scale = 1, rotate = 0, spring = false, as = "div" }: AppearProps) {
  const Comp = m[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y, scale, rotate }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={spring ? { delay, type: "spring", stiffness: 120, damping: 16 } : { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

/** Trait SVG qui se dessine. */
export function DrawPath(props: { d: string; stroke: string; strokeWidth: number; delay?: number }) {
  return (
    <m.path
      d={props.d}
      stroke={props.stroke}
      strokeWidth={props.strokeWidth}
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: props.delay ?? 0, duration: 0.9 }}
    />
  );
}

export { m };
