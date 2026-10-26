import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Picture } from "./Picture";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  slides: string[];
  alt: string;
  index: number;
  onChange: (i: number) => void;
  cycleTick: number;
  duration: number; // ms — auto-advance interval
  allLoaded: boolean;
  cardEyebrow: string;
  cardTitle: string;
  /** Crossfade duration in ms (default 350) */
  transitionMs?: number;
};

const mod = (n: number, m: number) => ((n % m) + m) % m;

export const CinematicHeroSlider = ({
  slides,
  alt,
  index,
  onChange,
  cycleTick,
  duration,
  allLoaded,
  cardEyebrow,
  cardTitle,
  transitionMs = 350,
}: Props) => {
  const tSec = transitionMs / 1000;
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({ [index]: true });

  useEffect(() => {
    if (typeof window === "undefined") return;
  }, []);

  useEffect(() => {
    setLoaded((prev) => ({ ...prev, [index]: true }));
  }, [index]);

  const go = (delta: number) => onChange(mod(index + delta, slides.length));

  const renderLayer = (i: number) => {
    const isActive = i === index;
    const isLoaded = loaded[i] ?? true;
    return (
      <div
        key={`layer-${i}`}
        className="absolute inset-0 h-full w-full transition-opacity duration-500 ease-out"
        style={{
          opacity: isActive ? 1 : 0,
          zIndex: isActive ? 2 : 1,
          transitionDelay: isActive ? "0ms" : "0ms",
        }}
      >
        <Picture
          src={slides[i]}
          alt={alt}
          data-editable-key={`hero.image${i + 1}_url`}
          draggable={false}
          loading={i === index ? "eager" : "lazy"}
          fetchPriority={i === index ? "high" : "low"}
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 220ms ease-out",
          }}
          onLoad={() => setLoaded((prev) => ({ ...prev, [i]: true }))}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-elevated group bg-transparent">
        {/* On garde le rendu immédiat. L’image suivante ne doit pas attendre le
            chargement complet de toutes les slides pour remplacer l’actuelle. */}
        <div className="absolute inset-0 bg-transparent">
          {slides.map((_, i) => renderLayer(i))}
        </div>

        <div className="pointer-events-none absolute inset-0" />
        {/* Counter badge */}
        <div
          className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-full glass-strong px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] font-semibold text-foreground"
        >
          <span className="tabular-nums text-foreground">{String(index + 1).padStart(2, "0")}</span>
          <span className="h-px w-4 bg-foreground/40" />
          <span className="tabular-nums text-foreground/60">{String(slides.length).padStart(2, "0")}</span>
        </div>

        {/* Floating navigation arrows */}
        <button
          type="button"
          aria-label="Slide précédente"
          onClick={(e) => { e.stopPropagation(); go(-1); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full glass-strong text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-white/20 transition-all duration-500"
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Slide suivante"
          onClick={(e) => { e.stopPropagation(); go(1); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full glass-strong text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-white/20 transition-all duration-500"
        >
          →
        </button>

        {/* Slide indicators (segmented progress) */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10"
        >
          {slides.map((_, i) => {
            const isActive = i === index;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Image ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(e) => { e.stopPropagation(); onChange(i); }}
                className={`relative h-1.5 rounded-full overflow-hidden transition-all duration-500 ${
                  isActive ? "w-8 bg-white/30" : "w-1.5 bg-white/45 hover:bg-white/80"
                }`}
              >
                {isActive && (
                  <motion.span
                    key={`${index}-${cycleTick}`}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: duration / 1000, ease: "linear" }}
                    className="absolute inset-y-0 left-0 bg-white"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Floating chip top-right */}
        <div
          className="absolute top-4 right-4 z-10 glass-strong rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold text-foreground"
        >
          ★ 4.92 / 5
        </div>

        {/* Bottom caption — kinetic text reveal per slide */}
        <div
          className="absolute inset-x-4 bottom-10 flex items-end justify-between gap-3 z-10"
        >
          <div className="photo-caption-text overflow-hidden">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] font-semibold">
                {cardEyebrow}
              </div>
              <div className="font-display text-xl md:text-2xl font-semibold mt-1 tracking-tight">
                {cardTitle}
              </div>
            </div>
          </div>
          <div className="h-11 w-11 rounded-full bg-white text-background flex items-center justify-center shrink-0 shadow-card">
            →
          </div>
        </div>
      </div>
    </div>
  );
};
