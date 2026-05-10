/**
 * Detect low-performance devices and tag <html class="low-perf">.
 * Triggers on: low CPU core count, low device memory, reduced-motion request,
 * or a slow first frame (proxy for older GPUs like 2014 iMacs).
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

  // Heuristic: iMac 2014 / older laptops typically report 4 cores & 4-8GB.
  // We treat <=4 cores OR <=4GB RAM OR explicit data-saver as low-perf.
  if (cores <= 4 || mem <= 4 || saveData || slowNet || reduce) {
    html.classList.add("low-perf");
  }
};
