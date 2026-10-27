/**
 * Detect low-performance devices and tag <html class="low-perf"> only when
 * the device really matches the conservative triggers we care about.
 * For regular desktop/mobile hardware, we keep the full experience and smooth
 * scrolling active so the site feels responsive and polished.
 */
export const initPerfDetection = () => {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  const saveData = nav.connection?.saveData === true;
  const slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isLowPerfDevice =
    cores <= 4 ||
    mem <= 4 ||
    saveData ||
    slowNet ||
    reduce;

  html.classList.toggle("low-perf", isLowPerfDevice);
};
