import { useEffect } from "react";

/**
 * Drives the ambient body backdrop parallax via CSS vars --mx / --my.
 * Slow, restrained motion. Respects prefers-reduced-motion.
 */
export const AmbientBackdrop = () => {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lowPerf = document.documentElement.classList.contains("low-perf");
    // Skip mouse-driven parallax on touch / low-perf — saves a constant rAF loop.
    if (reduce || coarse || lowPerf) return;

    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let running = false;

    const tick = () => {
      cx += (tx - cx) * 0.04;
      cy += (ty - cy) * 0.04;
      document.body.style.setProperty("--mx", `${cx.toFixed(2)}px`);
      document.body.style.setProperty("--my", `${cy.toFixed(2)}px`);
      // Stop the loop once we've settled — saves continuous rAF cost when idle.
      if (Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth, h = window.innerHeight;
      tx = ((e.clientX / w) - 0.5) * 48;
      ty = ((e.clientY / h) - 0.5) * 48;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
};
