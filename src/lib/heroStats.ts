export type HeroStat = { v: string; l: string };

/** Keep published figures stable; only correct the audit's known availability typo. */
export function resolveHeroStats(content: Record<string, string>): HeroStat[] {
  let stats: HeroStat[] = [];
  try {
    const parsed: unknown = JSON.parse(content["hero.stats_json"] || "[]");
    if (Array.isArray(parsed)) {
      stats = parsed.map((s) => ({
        v: String(s?.value ?? s?.v ?? "").trim(),
        l: String(s?.label ?? s?.l ?? "").trim(),
      })).filter((s) => s.v || s.l);
    }
  } catch { /* Legacy individual keys remain supported. */ }
  if (!stats.length) {
    stats = [
      { v: content["hero.stat1_value"] ?? "10+", l: content["hero.stat1_label"] ?? "Projets livrés" },
      { v: content["hero.stat2_value"] ?? "5 ans", l: content["hero.stat2_label"] ?? "d'expérience terrain" },
      { v: content["hero.stat3_value"] ?? "95%", l: content["hero.stat3_label"] ?? "Clients satisfaits" },
      { v: content["hero.stat4_value"] ?? "24/7", l: content["hero.stat4_label"] ?? "Support & maintenance" },
    ];
  }
  return stats.map((s) => ({ ...s, v: s.v.replace(/^23\s*\/\s*7$/, "24/7") }));
}