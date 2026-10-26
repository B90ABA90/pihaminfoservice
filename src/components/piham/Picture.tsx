import { forwardRef, type ImgHTMLAttributes, type CSSProperties } from "react";
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

  const { sources, img } = pic;
  const fallbackSrcSet = sources.jpg ?? sources.jpeg ?? sources.png;

  const imgStyle: CSSProperties = {
    ...(style as CSSProperties | undefined),
    opacity: 1,
    filter: "none",
  };

  const pictureStyle: CSSProperties = {
    display: "block",
    background: "transparent",
  };

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
        onLoad={onLoad}
        {...rest}
      />
    </picture>
  );
});
