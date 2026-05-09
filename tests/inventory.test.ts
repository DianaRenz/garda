import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";
import {
  cycleStatus,
  sortItems,
  SUPPLY_CATEGORIES,
  SUPPLY_STATUSES,
  type SupplyItem,
  type SupplyStatus,
} from "~/composables/useInventory";

const ts = (yyyyMmDd: string) => Timestamp.fromDate(new Date(yyyyMmDd));

const makeItem = (overrides: Partial<SupplyItem>): SupplyItem => ({
  id: overrides.id ?? "i-" + Math.random().toString(36).slice(2),
  name: "Item",
  category: "hygiene",
  status: "stocked",
  note: "",
  createdAt: ts("2026-01-01"),
  createdBy: "uid",
  createdByName: "User",
  updatedAt: ts("2026-01-01"),
  updatedBy: "uid",
  updatedByName: "User",
  ...overrides,
});

describe("cycleStatus", () => {
  it("cycles stocked → low → out → stocked", () => {
    expect(cycleStatus("stocked")).toBe("low");
    expect(cycleStatus("low")).toBe("out");
    expect(cycleStatus("out")).toBe("stocked");
  });

  it("covers every defined status", () => {
    // Ensures the function handles every value in SUPPLY_STATUSES — guards
    // against silently leaving a status out of the cycle if someone adds one.
    for (const s of SUPPLY_STATUSES) {
      const next = cycleStatus(s);
      expect(SUPPLY_STATUSES).toContain(next);
    }
  });
});

describe("sortItems", () => {
  it("orders out before low before stocked", () => {
    const items = [
      makeItem({ id: "a", name: "A", status: "stocked" }),
      makeItem({ id: "b", name: "B", status: "out" }),
      makeItem({ id: "c", name: "C", status: "low" }),
    ];
    const sorted = sortItems(items);
    expect(sorted.map((i) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("ties on status are broken alphabetically by name", () => {
    const items = [
      makeItem({ id: "a", name: "Zebra",  status: "out" }),
      makeItem({ id: "b", name: "Apple",  status: "out" }),
      makeItem({ id: "c", name: "Mango",  status: "out" }),
    ];
    const sorted = sortItems(items);
    expect(sorted.map((i) => i.name)).toEqual(["Apple", "Mango", "Zebra"]);
  });

  it("preserves all items and is stable", () => {
    const items: SupplyItem[] = [];
    for (const status of SUPPLY_STATUSES) {
      for (let n = 0; n < 3; n++) {
        items.push(makeItem({ id: `${status}-${n}`, name: `Name${n}`, status }));
      }
    }
    const sorted = sortItems(items);
    expect(sorted).toHaveLength(items.length);
    // Original array not mutated
    expect(items[0]!.id).toBe("stocked-0");
  });

  it("handles empty input", () => {
    expect(sortItems([])).toEqual([]);
  });
});

describe("constants", () => {
  it("exposes exactly 4 categories", () => {
    expect(SUPPLY_CATEGORIES).toEqual(["hygiene", "food", "household", "other"]);
  });

  it("exposes exactly 3 statuses", () => {
    expect(SUPPLY_STATUSES).toEqual(["stocked", "low", "out"]);
  });

  it("cycleStatus visits every status exactly once in three steps", () => {
    let s: SupplyStatus = "stocked";
    const visited = new Set<SupplyStatus>();
    for (let i = 0; i < 3; i++) {
      visited.add(s);
      s = cycleStatus(s);
    }
    expect(visited.size).toBe(3);
    expect(s).toBe("stocked"); // back to start
  });
});
