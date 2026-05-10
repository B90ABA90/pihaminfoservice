import { lazy, Suspense, useEffect, useRef, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { GlassNav } from "@/components/piham/GlassNav";
import { BannerTicker } from "@/components/piham/BannerTicker";
import { Hero } from "@/components/piham/Hero";
import { TrustBand } from "@/components/piham/TrustBand";
import { Loader } from "@/components/piham/Loader";

// Below-the-fold: split into separate chunks, mount only when near viewport.
const Services = lazy(() => import("@/components/piham/Services").then(m => ({ default: m.Services })));
const Process = lazy(() => import("@/components/piham/Process").then(m => ({ default: m.Process })));
const Showcase = lazy(() => import("@/components/piham/Showcase").then(m => ({ default: m.Showcase })));
const Sectors = lazy(() => import("@/components/piham/Sectors").then(m => ({ default: m.Sectors })));
const About = lazy(() => import("@/components/piham/About").then(m => ({ default: m.About })));
const Testimonials = lazy(() => import("@/components/piham/Testimonials").then(m => ({ default: m.Testimonials })));
const Reviews = lazy(() => import("@/components/piham/Reviews").then(m => ({ default: m.Reviews })));
const CTA = lazy(() => import("@/components/piham/CTA").then(m => ({ default: m.CTA })));
const Contact = lazy(() => import("@/components/piham/Contact").then(m => ({ default: m.Contact })));
const Footer = lazy(() => import("@/components/piham/Footer").then(m => ({ default: m.Footer })));
const WhatsAppFab = lazy(() => import("@/components/piham/WhatsAppFab").then(m => ({ default: m.WhatsAppFab })));
const ParallaxCard = lazy(() => import("@/components/piham/ParallaxCard").then(m => ({ default: m.ParallaxCard })));

/**
 * Mount children only when placeholder approaches the viewport.
 * On low-perf hardware uses a tighter rootMargin so we don't mount 4 sections
 * before the user actually scrolls — this slashes time-to-interactive on
 * older Macs / iGPUs by spreading hydration cost across the scroll.
 */
const Defer = ({ children, minHeight = 200 }: { children: ReactNode; minHeight?: number }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!ref.current || show) return;
    const el = ref.current;
    const lowPerf =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("low-perf");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: lowPerf ? "200px 0px" : "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);
  return (
    <div ref={ref} style={!show ? { minHeight, contentVisibility: "auto" as never } : undefined}>
      {show ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
};

/**
 * Warm up the lazy chunks during browser idle time so that when the user
 * scrolls and the IntersectionObserver fires, the JS is already parsed and
 * cached. Cheap on fast hardware, skipped entirely on low-perf to keep the
 * main thread free for the initial paint.
 */
const prefetchBelowFold = () => {
  if (typeof window === "undefined") return;
  if (document.documentElement.classList.contains("low-perf")) return;
  const idle =
    (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
  idle(() => {
    void import("@/components/piham/Services");
    void import("@/components/piham/Showcase");
    void import("@/components/piham/Process");
    void import("@/components/piham/Sectors");
    void import("@/components/piham/About");
    void import("@/components/piham/ParallaxCard");
  }, { timeout: 4000 });
  idle(() => {
    void import("@/components/piham/Testimonials");
    void import("@/components/piham/Reviews");
    void import("@/components/piham/CTA");
    void import("@/components/piham/Contact");
    void import("@/components/piham/Footer");
    void import("@/components/piham/WhatsAppFab");
  }, { timeout: 8000 });
};

const Index = () => {
  const location = useLocation();
  const { content } = useSiteContent();

  // Warm up below-the-fold chunks once on mount (idle-time, capable hardware only).
  useEffect(() => { prefetchBelowFold(); }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.hash]);

  // Admin preview: when loaded inside the visual editor iframe,
  // intercept clicks and notify the parent which section was clicked.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("admin-preview") !== "1") return;
    if (window.parent === window) return;

    const SECTION_IDS = [
      "banner", "hero", "trust", "about", "services", "showcase",
      "process", "sectors", "testimonials", "cta", "contact", "footer",
    ];

    const findSection = (el: HTMLElement | null): string | null => {
      let cur: HTMLElement | null = el;
      while (cur && cur !== document.body) {
        if (cur.id && SECTION_IDS.includes(cur.id)) return cur.id;
        cur = cur.parentElement;
      }
      return null;
    };

    const norm = (s: string) =>
      s.replace(/\s+/g, " ").trim().toLowerCase();
    const stripExt = (s: string) => s.replace(/\.[a-z0-9]+$/i, "");
    const fileTokens = (url: string): string[] => {
      try {
        const u = url.split("?")[0].split("#")[0];
        const last = u.split("/").pop() ?? u;
        const stem = stripExt(last);
        const tokens = [u, last, stem];
        const noHash = stem.replace(/[-.][A-Za-z0-9_]{6,}$/g, "");
        if (noHash && noHash !== stem) tokens.push(noHash);
        return tokens.filter(Boolean);
      } catch { return [url]; }
    };

    const isImageKey = (k: string) =>
      /image|logo|photo|cover|background|bg_url|_url$/i.test(k) && !k.endsWith("_alt");

    const textIndex = new Map<string, string[]>();
    const imageIndex = new Map<string, string[]>();
    const altToImageKey = new Map<string, string>();

    for (const [k, v] of Object.entries(content)) {
      if (!v) continue;
      if (k.endsWith("_json")) continue;
      if (isImageKey(k)) {
        for (const tok of fileTokens(v)) {
          const arr = imageIndex.get(tok) ?? [];
          arr.push(k);
          imageIndex.set(tok, arr);
        }
      } else if (k.endsWith("_alt")) {
        const base = k.slice(0, -4);
        const candidate = Object.keys(content).find(
          (kk) => isImageKey(kk) && (kk === base || kk === base + "_url" || kk.startsWith(base)),
        );
        if (candidate) altToImageKey.set(norm(v), candidate);
      } else {
        const n = norm(v);
        if (n.length >= 2 && n.length <= 300) {
          const arr = textIndex.get(n) ?? [];
          arr.push(k);
          textIndex.set(n, arr);
        }
      }
    }

    const pickKey = (keys: string[], section: string | null): string => {
      if (keys.length === 1 || !section) return keys[0];
      const inSection = keys.find((k) => k.startsWith(section + "."));
      return inSection ?? keys[0];
    };

    const findImageKey = (el: HTMLElement, section: string | null): string | null => {
      if (el.tagName === "IMG") {
        const img = el as HTMLImageElement;
        for (const tok of fileTokens(img.src)) {
          if (imageIndex.has(tok)) return pickKey(imageIndex.get(tok)!, section);
        }
        const alt = norm(img.alt ?? "");
        if (alt && altToImageKey.has(alt)) return altToImageKey.get(alt)!;
        return null;
      }
      const bg = (el.style.backgroundImage || getComputedStyle(el).backgroundImage || "");
      const match = bg.match(/url\(["']?(.+?)["']?\)/);
      if (match) {
        for (const tok of fileTokens(match[1])) {
          if (imageIndex.has(tok)) return pickKey(imageIndex.get(tok)!, section);
        }
      }
      return null;
    };

    const findTextKey = (el: HTMLElement, section: string | null): string | null => {
      let cur: HTMLElement | null = el;
      const visited: HTMLElement[] = [];
      while (cur && cur !== document.body && visited.length < 6) {
        visited.push(cur);
        const t = norm(cur.textContent ?? "");
        if (t && textIndex.has(t)) {
          return pickKey(textIndex.get(t)!, section);
        }
        cur = cur.parentElement;
      }
      if (section) {
        for (const node of visited) {
          const t = norm(node.textContent ?? "");
          if (!t) continue;
          for (const [val, keys] of textIndex) {
            if (val.length < 4) continue;
            if (t.includes(val)) {
              const k = pickKey(keys, section);
              if (k.startsWith(section + ".")) return k;
            }
          }
        }
      }
      return null;
    };

    const findKeyForElement = (el: HTMLElement | null): { key: string; node: HTMLElement } | null => {
      if (!el) return null;
      const section = findSection(el);
      const tagged = el.closest<HTMLElement>("[data-editable-key]");
      if (tagged) return { key: tagged.getAttribute("data-editable-key")!, node: tagged };
      const imgEl = el.tagName === "IMG"
        ? el
        : el.querySelector?.("img") as HTMLElement | null;
      if (imgEl) {
        const k = findImageKey(imgEl, section);
        if (k) return { key: k, node: imgEl };
      }
      const bgKey = findImageKey(el, section);
      if (bgKey) return { key: bgKey, node: el };
      const tk = findTextKey(el, section);
      if (tk) {
        let cur: HTMLElement | null = el;
        let best: HTMLElement = el;
        while (cur && cur !== document.body) {
          const t = norm(cur.textContent ?? "");
          const keys = textIndex.get(t);
          if (keys && keys.includes(tk)) best = cur;
          cur = cur.parentElement;
        }
        return { key: tk, node: best };
      }
      return null;
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      e.preventDefault();
      e.stopPropagation();
      const hit = findKeyForElement(target);
      const section = findSection(target);
      if (hit) {
        let imageUrl: string | undefined;
        let imageAlt: string | undefined;
        const imgNode =
          hit.node.tagName === "IMG"
            ? (hit.node as HTMLImageElement)
            : (hit.node.querySelector?.("img") as HTMLImageElement | null);
        if (imgNode) {
          imageUrl = imgNode.currentSrc || imgNode.src;
          imageAlt = imgNode.alt;
        }
        window.parent.postMessage(
          {
            type: "lovable-element-click",
            key: hit.key,
            section: section ?? hit.key.split(".")[0],
            imageUrl,
            imageAlt,
          },
          "*",
        );
        return;
      }
      if (section) {
        window.parent.postMessage({ type: "lovable-section-click", section }, "*");
      }
    };

    document.addEventListener("click", onClick, true);

    const clearHover = () => {
      document.querySelectorAll<HTMLElement>("[data-admin-hover]").forEach((el) => {
        el.style.outline = "";
        el.style.outlineOffset = "";
        el.style.cursor = "";
        el.removeAttribute("data-admin-hover");
      });
    };
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      clearHover();
      const hit = findKeyForElement(target);
      let el: HTMLElement | null = null;
      if (hit) {
        el = hit.node;
      } else {
        const sec = findSection(target);
        if (sec) el = document.getElementById(sec);
      }
      if (el) {
        el.style.outline = hit ? "2px solid hsl(var(--accent))" : "2px dashed hsl(var(--accent))";
        el.style.outlineOffset = hit ? "2px" : "-4px";
        el.style.cursor = "pointer";
        el.setAttribute("data-admin-hover", "1");
      }
    };
    document.addEventListener("mouseover", onOver);

    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "lovable-scroll" && typeof e.data.id === "string") {
        const el = document.getElementById(e.data.id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("message", onMessage);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("message", onMessage);
    };
  }, [location.search, content]);

  return (
    <main className="relative bg-background text-foreground overflow-x-hidden">
      <Loader />
      <BannerTicker />
      <GlassNav />
      <Hero />
      <TrustBand />
      <Defer minHeight={600}><Services /></Defer>
      <Defer minHeight={600}>
        <ParallaxCard intensity={0.6}>
          <Showcase />
        </ParallaxCard>
      </Defer>
      <Defer minHeight={400}><Process /></Defer>
      <Defer minHeight={400}><Sectors /></Defer>
      <Defer minHeight={500}>
        <ParallaxCard intensity={0.5}>
          <About />
        </ParallaxCard>
      </Defer>
      <Defer minHeight={400}><Testimonials /></Defer>
      <Defer minHeight={400}><Reviews /></Defer>
      <Defer minHeight={300}><CTA /></Defer>
      <Defer minHeight={500}><Contact /></Defer>
      <Defer minHeight={300}><Footer /></Defer>
      <Suspense fallback={null}><WhatsAppFab /></Suspense>
    </main>
  );
};

export default Index;
