import { forwardRef, useState, type ImgHTMLAttributes, type CSSProperties } from "react";
import { getPicture } from "@/lib/optimizedImages";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "srcSet"> & {
  src: string;
  alt: string;
  /** `sizes` attribute applied to all `<source>`s. Defaults to a sensible responsive heuristic. */
  sizes?: string;
  /** Optional className applied to the rendered <img> element. */
  className?: string;
  /** Optional className applied to the wrapping <picture>. */
  pictureClassName?: string;
  /** Disable the LQIP blur placeholder (useful for transparent images / logos). */
  noPlaceholder?: boolean;
};

/**
 * Modern responsive image. Emits a `<picture>` with AVIF + WebP sources and a JPG
 * fallback when the `src` matches a build-time-optimized asset; otherwise renders
 * a plain `<img>` (admin-uploaded URLs, external URLs, etc).
 *
 * Defaults: `loading="lazy"`, `decoding="async"`, and a tiny blurred LQIP
 * placeholder painted under the image until it finishes decoding.
 */
export const Picture = forwardRef<HTMLImageElement, Props>(function Picture(
  {
    src,
    alt,
    sizes = "(min-width: 1280px) 1200px, (min-width: 768px) 60vw, 100vw",
    className,
    pictureClassName,
    loading = "lazy",
    decoding = "async",
    noPlaceholder = false,
    onLoad,
    style,
    ...rest
  },
  ref,
) {
  const pic = getPicture(src);
  const [loaded, setLoaded] = useState(false);

  // Plain fallback for non-optimized URLs (admin uploads, externals).
  if (!pic) {
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={className}
        style={style}
        onLoad={onLoad}
        {...rest}
      />
    );
  }

  const { sources, img, placeholder } = pic;
  const fallbackSrcSet = sources.jpg ?? sources.jpeg ?? sources.png;

  // Compose styles: smooth fade-in as image decodes; LQIP painted underneath.
  const showPlaceholder = !noPlaceholder && !!placeholder && !loaded;
  const imgStyle: CSSProperties = {
    ...(style as CSSProperties | undefined),
    opacity: loaded ? 1 : 0,
    transition: "opacity 400ms ease-out",
  };
  const pictureStyle: CSSProperties = {
    display: "block",
    ...(showPlaceholder
      ? {
          backgroundImage: `url("${placeholder}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }
      : null),
  };

  // Mirror the layout className onto the <picture> so its box matches the <img>'s
  // (so the LQIP background occupies the same area). The inner <img> keeps the
  // same className for object-fit / sizing; harmless extra layout classes on
  // <picture> are ignored since it's not a replaced element.
  return (
    <picture className={pictureClassName ?? className} style={pictureStyle}>
      {sources.avif && <source type="image/avif" srcSet={sources.avif} sizes={sizes} />}
      {sources.webp && <source type="image/webp" srcSet={sources.webp} sizes={sizes} />}
      <img
        ref={ref}
        src={img.src}
        srcSet={fallbackSrcSet}
        sizes={sizes}
        width={img.w}
        height={img.h}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={className}
        style={imgStyle}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        {...rest}
      />
    </picture>
  );
});
