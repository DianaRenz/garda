import { describe, it, expect, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { Timestamp } from "firebase/firestore";
import type { Booking, BookingStatus } from "~/composables/useBookings";

mockNuxtImport("useI18n", () => () => ({
  locale: { value: "ru" },
  t: (key: string) => key,
}));

const ts = (yyyyMmDd: string) => Timestamp.fromDate(new Date(yyyyMmDd));

const makeBooking = (overrides: Partial<Booking> = {}): Booking => ({
  id: overrides.id ?? "b-" + Math.random().toString(36).slice(2),
  guestId: null,
  userId: null,
  guestName: "Test Guest",
  guestPhone: "",
  guestEmail: "",
  startDate: ts("2026-05-01"),
  endDate: ts("2026-05-05"),
  status: "confirmed" as BookingStatus,
  source: "admin",
  notes: "",
  rejectionNote: null,
  createdAt: ts("2026-01-01"),
  updatedAt: ts("2026-01-01"),
  ...overrides,
});

describe("useBookings.getConflicts", () => {
  let bookings: ReturnType<typeof useBookings>;

  beforeEach(async () => {
    const { useBookings } = await import("~/composables/useBookings");
    bookings = useBookings();
    bookings.bookings.value = [];
  });

  it("returns empty when no other bookings exist", () => {
    const candidate = makeBooking();
    expect(bookings.getConflicts(candidate)).toEqual([]);
  });

  it("ignores the booking itself by id when checking conflicts", () => {
    const existing = makeBooking({ id: "same" });
    bookings.bookings.value = [existing];
    expect(bookings.getConflicts(existing)).toEqual([]);
  });

  it("detects fully-overlapping ranges", () => {
    const existing = makeBooking({
      id: "existing",
      startDate: ts("2026-05-01"),
      endDate: ts("2026-05-10"),
    });
    bookings.bookings.value = [existing];
    const candidate = makeBooking({
      id: "candidate",
      startDate: ts("2026-05-03"),
      endDate: ts("2026-05-07"),
    });
    expect(bookings.getConflicts(candidate)).toHaveLength(1);
    expect(bookings.getConflicts(candidate)[0]!.id).toBe("existing");
  });

  it("detects ranges that touch at endpoints (treated as overlap)", () => {
    const existing = makeBooking({
      id: "existing",
      startDate: ts("2026-05-01"),
      endDate: ts("2026-05-05"),
    });
    bookings.bookings.value = [existing];
    const candidate = makeBooking({
      id: "candidate",
      startDate: ts("2026-05-05"),
      endDate: ts("2026-05-10"),
    });
    expect(bookings.getConflicts(candidate)).toHaveLength(1);
  });

  it("does not flag non-overlapping ranges", () => {
    const existing = makeBooking({
      id: "existing",
      startDate: ts("2026-05-01"),
      endDate: ts("2026-05-05"),
    });
    bookings.bookings.value = [existing];
    const candidate = makeBooking({
      id: "candidate",
      startDate: ts("2026-05-06"),
      endDate: ts("2026-05-10"),
    });
    expect(bookings.getConflicts(candidate)).toEqual([]);
  });

  it("ignores rejected, blocked, and cancelled bookings", () => {
    bookings.bookings.value = [
      makeBooking({ id: "rejected", status: "rejected" }),
      makeBooking({ id: "blocked", status: "blocked" }),
      makeBooking({ id: "cancelled", status: "cancelled" }),
    ];
    const candidate = makeBooking({
      id: "candidate",
      startDate: ts("2026-05-01"),
      endDate: ts("2026-05-05"),
    });
    expect(bookings.getConflicts(candidate)).toEqual([]);
  });

  it("flags pending and confirmed bookings as conflicts", () => {
    bookings.bookings.value = [
      makeBooking({ id: "pending", status: "pending" }),
      makeBooking({ id: "confirmed", status: "confirmed" }),
    ];
    const candidate = makeBooking({
      id: "candidate",
      startDate: ts("2026-05-01"),
      endDate: ts("2026-05-05"),
    });
    const conflicts = bookings.getConflicts(candidate);
    expect(conflicts.map((b) => b.id).sort()).toEqual(["confirmed", "pending"]);
  });

  it("returns empty when candidate has no dates", () => {
    bookings.bookings.value = [makeBooking({ id: "existing" })];
    const candidate = makeBooking({
      id: "candidate",
      startDate: undefined as any,
      endDate: undefined as any,
    });
    expect(bookings.getConflicts(candidate)).toEqual([]);
  });
});

describe("useBookings.statusColor", () => {
  it("maps every BookingStatus to a Vuetify color name", async () => {
    const { useBookings } = await import("~/composables/useBookings");
    const { statusColor } = useBookings();
    const statuses: BookingStatus[] = [
      "pending",
      "confirmed",
      "blocked",
      "rejected",
      "cancelled",
    ];
    for (const s of statuses) {
      expect(statusColor[s]).toBeTruthy();
      expect(typeof statusColor[s]).toBe("string");
    }
  });
});

describe("useBookings.formatDate", () => {
  it("returns em-dash for undefined timestamp", async () => {
    const { useBookings } = await import("~/composables/useBookings");
    const { formatDate } = useBookings();
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns a non-empty formatted string for a valid timestamp", async () => {
    const { useBookings } = await import("~/composables/useBookings");
    const { formatDate } = useBookings();
    const result = formatDate(ts("2026-05-15"));
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe("—");
  });
});
