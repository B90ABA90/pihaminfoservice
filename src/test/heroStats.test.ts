import { describe, expect, it } from "vitest";
import { resolveHeroStats } from "../lib/heroStats";

describe("Audit availability correction", () => {
  it("corrects 23/7 in JSON statistics to 24/7", () => {
    expect(resolveHeroStats({ "hero.stats_json": JSON.stringify([{ value: "23/7", label: "Support & maintenance" }]) })[0].v).toBe("24/7");
  });
  it("corrects 23/7 in legacy statistics to 24/7", () => {
    expect(resolveHeroStats({ "hero.stat4_value": "23/7" })[3].v).toBe("24/7");
  });
  it("preserves supplied satisfaction rather than inventing a replacement", () => {
    expect(resolveHeroStats({ "hero.stats_json": JSON.stringify([{ value: "91%", label: "Clients satisfaits" }]) })[0].v).toBe("91%");
  });
});