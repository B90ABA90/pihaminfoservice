// Build-time registry of responsive AVIF/WebP/JPG variants for every
// image in src/assets/. We use parallel globs so we can map the
// "default" (string URL) import to its corresponding `<picture>` payload
// AND to a tiny low-quality blurred placeholder.

type PictureSources = {
  avif?: string;
  webp?: string;
  jpg?: string;
  jpeg?: string;
  png?: string;
};

export type PictureData = {
  sources: PictureSources;
  img: { src: string; w: number; h: number };
  /** Tiny pre-blurred WebP URL used as a placeholder while the full image loads. */
  placeholder?: string;
};

// 1) Default URL — same shape every existing import already returns.
const defaults = import.meta.glob("/src/assets/*.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

// 2) Responsive picture payload — multiple widths × AVIF + WebP + JPG fallback.
const pictures = import.meta.glob("/src/assets/*.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
  query: {
    format: "avif;webp;jpg",
    w: "480;800;1200;1600",
    as: "picture",
  },
}) as Record<string, Omit<PictureData, "placeholder">>;

// 3) Tiny blurred placeholder (LQIP) — ~24px wide, heavily compressed WebP.
//    Browsers can decode and paint this in microseconds; the URL itself is
//    only a few hundred bytes.
const placeholders = import.meta.glob("/src/assets/*.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
  query: {
    w: "24",
    format: "webp",
    quality: "30",
    blur: "4",
  },
}) as Record<string, string>;

const map = new Map<string, PictureData>();
for (const path in defaults) {
  const url = defaults[path];
  const pic = pictures[path];
  if (url && pic) {
    map.set(url, { ...pic, placeholder: placeholders[path] });
  }
}

/** Look up the responsive `<picture>` payload for a previously-imported asset URL. */
export function getPicture(src: string | undefined | null): PictureData | undefined {
  if (!src) return undefined;
  return map.get(src);
}
