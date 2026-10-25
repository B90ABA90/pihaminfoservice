# Architecture rules
- Resolve home statistics through `src/lib/heroStats.ts` so JSON and legacy content share the same corrections without fabricating business figures.
- Use `Picture` for site photography so local images receive the existing responsive AVIF/WebP variants; uploaded photos use asset pointers.
- Keep marquee pause controls keyboard-accessible and honor reduced-motion preferences so movement is optional.