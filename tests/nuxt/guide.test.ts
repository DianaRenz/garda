import { describe, it, expect, beforeEach } from "vitest";
import { useGuide, GUIDE_SECTION_KEYS, GUIDE_LOCALES } from "~/composables/useGuide";

describe("useGuide", () => {
  let g: ReturnType<typeof useGuide>;

  beforeEach(() => {
    g = useGuide();
    // reset to a known empty state for each test
    g.guide.value = {
      gallery: { apartment: [], garden: [], view: [] },
      sections: Object.fromEntries(
        GUIDE_SECTION_KEYS.map((k) => [
          k,
          { text: { ru: "", en: "", de: "" }, photos: [] },
        ])
      ),
      checkoutItems: { ru: [], en: [], de: [] },
      updatedAt: null,
    };
  });

  describe("section keys & locales", () => {
    it("exposes the expected eight section keys", () => {
      expect(GUIDE_SECTION_KEYS).toEqual([
        "directions",
        "checkin",
        "electricity",
        "kitchen",
        "wifi",
        "grounds",
        "trash",
        "emergency",
      ]);
    });

    it("supports ru/en/de locales", () => {
      expect([...GUIDE_LOCALES]).toEqual(["ru", "en", "de"]);
    });
  });

  describe("getSectionText", () => {
    it("returns the requested locale when present", () => {
      g.guide.value.sections.checkin!.text = {
        ru: "Заезд",
        en: "Check-in",
        de: "Anreise",
      };
      expect(g.getSectionText("checkin", "en")).toBe("Check-in");
      expect(g.getSectionText("checkin", "de")).toBe("Anreise");
      expect(g.getSectionText("checkin", "ru")).toBe("Заезд");
    });

    it("falls back to ru when the requested locale is empty", () => {
      g.guide.value.sections.checkin!.text = { ru: "Заезд", en: "", de: "" };
      expect(g.getSectionText("checkin", "en")).toBe("Заезд");
      expect(g.getSectionText("checkin", "de")).toBe("Заезд");
    });

    it("returns empty string when no text exists at all", () => {
      expect(g.getSectionText("checkin", "en")).toBe("");
    });

    it("returns empty string for an unknown section key", () => {
      expect(g.getSectionText("does-not-exist", "ru")).toBe("");
    });
  });

  describe("getCheckoutItems", () => {
    it("returns the requested locale when its list is non-empty", () => {
      g.guide.value.checkoutItems = {
        ru: ["Закрыть окна"],
        en: ["Close windows", "Take out trash"],
        de: [],
      };
      expect(g.getCheckoutItems("en")).toEqual([
        "Close windows",
        "Take out trash",
      ]);
    });

    it("falls back to ru when the requested locale is empty", () => {
      g.guide.value.checkoutItems = {
        ru: ["Закрыть окна"],
        en: [],
        de: [],
      };
      expect(g.getCheckoutItems("en")).toEqual(["Закрыть окна"]);
      expect(g.getCheckoutItems("de")).toEqual(["Закрыть окна"]);
    });

    it("returns empty array when no items exist for any locale", () => {
      expect(g.getCheckoutItems("en")).toEqual([]);
    });

    it("returns empty array for an unknown locale (with no ru fallback)", () => {
      g.guide.value.checkoutItems = { ru: [], en: [], de: [] };
      expect(g.getCheckoutItems("fr")).toEqual([]);
    });
  });
});
