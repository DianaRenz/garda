import { describe, it, expect } from "vitest";
import {
  HOUSE_PHOTOS,
  APARTMENT_PHOTOS,
  LAKE_PHOTOS,
  HOUSE_CAROUSEL,
  APARTMENT_CAROUSEL,
} from "~/utils/photos";

const groups = {
  HOUSE_PHOTOS,
  APARTMENT_PHOTOS,
  LAKE_PHOTOS,
  HOUSE_CAROUSEL,
  APARTMENT_CAROUSEL,
};

describe("utils/photos", () => {
  for (const [name, list] of Object.entries(groups)) {
    describe(name, () => {
      it("is a non-empty array", () => {
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThan(0);
      });

      it("contains only absolute paths under /photos/", () => {
        for (const path of list) {
          expect(path.startsWith("/photos/")).toBe(true);
        }
      });

      it("contains only image files (jpg/jpeg/png/webp)", () => {
        for (const path of list) {
          expect(path).toMatch(/\.(jpe?g|png|webp)$/i);
        }
      });

      it("has no duplicate entries", () => {
        const unique = new Set(list);
        expect(unique.size).toBe(list.length);
      });
    });
  }

  it("HOUSE_CAROUSEL items are a subset of HOUSE_PHOTOS or LAKE_PHOTOS", () => {
    const allHouse = new Set([...HOUSE_PHOTOS, ...LAKE_PHOTOS]);
    for (const path of HOUSE_CAROUSEL) {
      expect(allHouse.has(path)).toBe(true);
    }
  });

  it("APARTMENT_CAROUSEL items are a subset of APARTMENT_PHOTOS", () => {
    const all = new Set(APARTMENT_PHOTOS);
    for (const path of APARTMENT_CAROUSEL) {
      expect(all.has(path)).toBe(true);
    }
  });
});
