import { useRef, useState, useEffect, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SectionHeading } from "./SectionHeading";
import { Lightbox, type MediaItem } from "./Lightbox";
import { useReveal } from "@/hooks/useReveal";
import { Picture } from "./Picture";
import rehab1 from "@/assets/showcase-rehab-1.jpg";
import rehab2 from "@/assets/showcase-rehab-2.jpg";
import rehab3 from "@/assets/showcase-rehab-3.jpg";
import rehab4 from "@/assets/showcase-rehab-4.jpg";
import rehab5 from "@/assets/showcase-rehab-5.jpg";
import rehab6 from "@/assets/showcase-rehab-6.jpg";
import rehabVideo from "@/assets/showcase-rehab-video.mp4.asset.json";

type CinematicCardProps = {
  item: MediaItem;
  index: number;
  hoveredIndex: number | null;
  pointer: { x: number; y: number; active: boolean };
  cardRect: (el: HTMLElement | null, i: number) => void;
  imgKey: string;
  isAboveFold: boolean;
  spanClass: string;
  onOpen: () => void;
  onHover: (i: number | null) => void;
};

const SPRING = { stiffness: 180, damping: 22, mass: 0.6 };

const CinematicCard = ({
  item,
  index,
  hoveredIndex,
  pointer,
  cardRect,
  imgKey,
  isAboveFold,
  spanClass,
  onOpen,
  onHover,
}: CinematicCardProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const localX = useMotionValue(0); // -1..1
  const localY = useMotionValue(0);
  const proximity = useMotionValue(0); // 0..1

  const sx = useSpring(localX, SPRING);
  const sy = useSpring(localY, SPRING);
  const sProx = useSpring(proximity, { stiffness: 120, damping: 20 });

  const isHovered = hoveredIndex === index;
  const anyHovered = hoveredIndex !== null;
  const isOther = anyHovered && !isHovered;

  // Tilt: hovered follows cursor strongly, neighbors tilt toward cursor softly
  const rotateY = useTransform(sx, (v) => v * (isHovered ? 14 : 6));
  const rotateX = useTransform(sy, (v) => -v * (isHovered ? 12 : 5));
  const translateZ = useTransform(sProx, (v) =>
    isHovered ? 80 : v * 30
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || !pointer.active) {
      localX.set(0);
      localY.set(0);
      proximity.set(0);
      return;
    }
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = pointer.x - cx;
    const dy = pointer.y - cy;
    const dist = Math.hypot(dx, dy);
    const nx = Math.max(-1.2, Math.min(1.2, dx / (rect.width / 2)));
    const ny = Math.max(-1.2, Math.min(1.2, dy / (rect.height / 2)));
    localX.set(nx);
    localY.set(ny);
    const p = Math.max(0, 1 - dist / 320);
    proximity.set(p);
  }, [pointer, localX, localY, proximity]);

  return (
    <motion.button
      ref={(el) => {
        (ref as any).current = el;
        cardRect(el, index);
      }}
      onClick={onOpen}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      aria-label={`Ouvrir ${item.title}`}
      style={{
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
        z: translateZ,
        scale: isHovered ? 1.06 : isOther ? 0.97 : 1.0,
        filter: isOther ? "blur(3px) brightness(0.7)" : "blur(0px) brightness(1)",
        opacity: isOther ? 0.65 : 1,
        zIndex: isHovered ? 50 : 1,
        willChange: "transform, filter",
      }}
      transition={{ type: "spring", ...SPRING }}
      data-editable-key={imgKey}
      className={`group relative text-left rounded-2xl overflow-hidden bg-card border border-border/60 [transform-style:preserve-3d] h-full min-h-[12rem] sm:min-h-[14rem] lg:min-h-[16rem] ${spanClass}`}
    >
      {/* Ambient glow halo */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, hsl(var(--accent) / 0.45), transparent 70%)",
          filter: "blur(28px)",
          zIndex: -1,
        }}
      />

      <div
        className="relative h-full w-full overflow-hidden"
        style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="absolute inset-0 h-full w-full"
          style={{
            scale: isHovered ? 1.12 : 1,
            transition: "scale 1.2s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <Picture
            src={item.type === "video" ? item.poster! : item.src}
            alt={item.title}
            loading={isAboveFold ? "eager" : "lazy"}
            fetchPriority={isAboveFold ? "high" : "low"}
            sizes="(min-width: 1024px) 50vw, 100vw"
            data-editable-key={imgKey}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>

        {/* Permanent bottom gradient for legible title */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, hsl(0 0% 0% / 0.85) 100%)",
          }}
        />
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: useTransform(
              [sx, sy] as any,
              ([x, y]: any) =>
                `radial-gradient(400px circle at ${50 + x * 30}% ${
                  50 + y * 30
                }%, hsl(0 0% 100% / 0.18), transparent 60%)`
            ),
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.4s ease",
            mixBlendMode: "overlay",
          }}
        />

        {/* Tag chip */}
        <div
          className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.18em] font-semibold text-neutral-900"
          style={{ transform: "translateZ(60px)" }}
        >
          {item.tag}
        </div>


        {/* Animated border glow */}
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: isHovered
              ? "inset 0 0 0 1px hsl(var(--accent) / 0.6), 0 30px 80px -20px hsl(var(--accent) / 0.55)"
              : "inset 0 0 0 1px hsl(0 0% 100% / 0.04)",
            transition: "box-shadow 0.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        />

        {/* Title overlay at bottom */}
        <div
          className="absolute inset-x-0 bottom-0 p-3 sm:p-5 flex items-end justify-between gap-2 sm:gap-3"
          style={{ transform: "translateZ(50px)" }}
        >
          <div className="text-xs sm:text-sm md:text-base font-semibold text-white drop-shadow-md leading-snug line-clamp-2">
            <span className="block h-0.5 w-6 sm:w-8 bg-[hsl(var(--accent))] mb-1.5 sm:mb-2 origin-left transition-transform duration-500"
              style={{ transform: isHovered ? "scaleX(2.5)" : "scaleX(1)" }}
            />
            {item.title}
          </div>
          <span className="shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/95 flex items-center justify-center text-neutral-900 group-hover:bg-[hsl(var(--accent))] group-hover:text-white transition-all duration-300 text-sm">
            ↗
          </span>
        </div>
      </div>
    </motion.button>
  );
};

export const Showcase = () => {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0, active: false });
  const isMobile = useIsMobile();
  const sectionRef = useReveal<HTMLDivElement>(0.18);
  const gridRef = useReveal<HTMLDivElement>(0.12);
  const { content, getImage } = useSiteContent();
  const pick = (key: string, fallback: string) =>
    (content[key] ?? "").trim() ? getImage(key) : fallback;

  const projects: MediaItem[] = [
    { type: "image", src: pick("showcase.image1_url", rehab1), title: content["showcase.image1_title"] || "Façade coloniale — avant intervention", tag: "Réhabilitation" },
    { type: "image", src: pick("showcase.image2_url", rehab2), title: content["showcase.image2_title"] || "Façade restaurée — livraison finale", tag: "Réhabilitation" },
    { type: "image", src: pick("showcase.image3_url", rehab3), title: content["showcase.image3_title"] || "Chantier de réhabilitation", tag: "Réhabilitation" },
    { type: "image", src: pick("showcase.image4_url", rehab4), title: content["showcase.image4_title"] || "Salle de classe — préparation", tag: "Réhabilitation" },
    { type: "image", src: pick("showcase.image5_url", rehab5), title: content["showcase.image5_title"] || "Salle de classe — après livraison", tag: "Réhabilitation" },
    { type: "image", src: pick("showcase.image6_url", rehab6), title: content["showcase.image6_title"] || "Bâtiment municipal — réhabilitation complète", tag: "Réhabilitation" },
  ];

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    setPointer({ x: e.clientX, y: e.clientY, active: true });
  };
  const handleLeave = () => {
    setPointer((p) => ({ ...p, active: false }));
    setHoveredIndex(null);
  };

  return (
    <section id="showcase" className="relative py-24 md:py-32 bg-background-elevated overflow-hidden">
      <div ref={sectionRef} className="container reveal-stagger">
        <SectionHeading
          eyebrow={content["showcase.eyebrow"]}
          title={
            <>
              {content["showcase.title_line1"]} <br />
              <span className="text-gradient-accent">{content["showcase.title_accent"]}</span>
            </>
          }
          description={content["showcase.description"]}
        />

        <div
          ref={gridRef}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          className="reveal-stagger mt-12 grid grid-cols-2 lg:grid-cols-4 lg:auto-rows-[16rem] gap-4 md:gap-6"
          style={{ perspective: 1600, perspectiveOrigin: "50% 30%" }}
        >
          {projects.map((p, i) => {
            // Bento layout: asymmetric tiles on lg+
            const spans = [
              "col-span-2 lg:col-span-2 lg:row-span-2", // 0 — featured
              "col-span-2 lg:col-span-2 lg:row-span-1", // 1
              "col-span-1 lg:col-span-1 lg:row-span-1", // 2 (video)
              "col-span-1 lg:col-span-1 lg:row-span-1", // 3
              "col-span-2 lg:col-span-2 lg:row-span-1", // 4
              "col-span-2 lg:col-span-2 lg:row-span-1", // 5
            ];
            return (
              <CinematicCard
                key={i}
                item={p}
                index={i}
                hoveredIndex={hoveredIndex}
                pointer={pointer}
                cardRect={() => {}}
                imgKey={`showcase.image${i + 1}_url`}
                isAboveFold={i < 3}
                spanClass={spans[i] ?? ""}
                onOpen={() => setLightbox(i)}
                onHover={setHoveredIndex}
              />
            );
          })}
        </div>
      </div>

      {lightbox !== null && (
        <Lightbox
          index={lightbox}
          items={projects}
          onClose={() => setLightbox(null)}
          onChange={setLightbox}
        />
      )}
    </section>
  );
};
