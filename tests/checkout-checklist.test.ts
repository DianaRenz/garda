import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mergeCheckoutItems } from "~/composables/useGuide";

// Read locales directly from disk — Vitest's JSON ESM import wraps arrays
// as Module objects, breaking string-shape assertions. Raw fs.readFileSync +
// JSON.parse gives us the actual arrays as authored.
const localeDir = resolve(dirname(fileURLToPath(import.meta.url)), "../i18n/locales");
const loadLocale = (code: string) =>
  JSON.parse(readFileSync(resolve(localeDir, `${code}.json`), "utf8"));

const baseItems: Record<"ru" | "en" | "de", string[]> = {
  ru: loadLocale("ru").guide.checkout.baseItems,
  en: loadLocale("en").guide.checkout.baseItems,
  de: loadLocale("de").guide.checkout.baseItems,
};

describe("mergeCheckoutItems", () => {
  it("puts base items first, extras after", () => {
    expect(mergeCheckoutItems(["A", "B"], ["C", "D"])).toEqual(["A", "B", "C", "D"]);
  });

  it("returns base unchanged when extras are empty", () => {
    expect(mergeCheckoutItems(["A", "B"], [])).toEqual(["A", "B"]);
  });

  it("returns extras unchanged when base is empty", () => {
    expect(mergeCheckoutItems([], ["X"])).toEqual(["X"]);
  });

  it("does not mutate input arrays", () => {
    const base = ["A"];
    const extras = ["B"];
    mergeCheckoutItems(base, extras);
    expect(base).toEqual(["A"]);
    expect(extras).toEqual(["B"]);
  });

  it("preserves duplicate strings (no dedup)", () => {
    // Admin might accidentally re-add a base item; we don't silently filter
    // — UI hint about built-in items is the prevention layer.
    expect(mergeCheckoutItems(["A"], ["A"])).toEqual(["A", "A"]);
  });
});

describe("checkout base items (i18n sanity)", () => {
  it("has the same item count in every locale", () => {
    const lengths = new Set([
      baseItems.ru.length,
      baseItems.en.length,
      baseItems.de.length,
    ]);
    expect(lengths.size).toBe(1);
  });

  it("is non-empty in every locale", () => {
    expect(baseItems.ru.length).toBeGreaterThan(0);
    expect(baseItems.en.length).toBeGreaterThan(0);
    expect(baseItems.de.length).toBeGreaterThan(0);
  });

  it("has only non-empty string entries in every locale", () => {
    for (const [loc, items] of Object.entries(baseItems)) {
      for (const item of items) {
        expect(typeof item, `${loc} item type`).toBe("string");
        expect((item as string).length, `${loc} item non-empty`).toBeGreaterThan(0);
      }
    }
  });

  // Regression guard for the original incident: a guest didn't defrost the
  // fridge, mould grew between visits. The fridge rule MUST be the first item
  // (most prominent) in every locale and MUST mention the keyword so future
  // refactors don't silently drop or reorder it.
  it("first item is the fridge rule in every locale", () => {
    expect(baseItems.ru[0]).toMatch(/холодильник/i);
    expect(baseItems.en[0]).toMatch(/fridge/i);
    expect(baseItems.de[0]).toMatch(/Kühlschrank/i);
  });

  it("first item explains the consequence (mould)", () => {
    expect(baseItems.ru[0]).toMatch(/плесень/i);
    expect(baseItems.en[0]).toMatch(/mould|mold/i);
    expect(baseItems.de[0]).toMatch(/Schimmel/i);
  });
});
