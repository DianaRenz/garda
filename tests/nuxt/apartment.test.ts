import { describe, it, expect, vi, beforeEach } from "vitest";
import * as firestore from "firebase/firestore";

describe("useApartment.saveApartment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards a partial update (just paypalLink) without overwriting other fields", async () => {
    const setDocSpy = firestore.setDoc as unknown as ReturnType<typeof vi.fn>;
    const { useApartment } = await import("~/composables/useApartment");
    const { apartment, saveApartment } = useApartment();

    apartment.value = {
      title: "T",
      description: "D",
      address: "A",
      directions: "Dir",
      rules: "R",
      paypalLink: null,
      photos: ["x.jpg"],
    };

    await saveApartment({ paypalLink: "https://paypal.me/x" });

    expect(setDocSpy).toHaveBeenCalledTimes(1);
    const [, payload, options] = setDocSpy.mock.calls[0]!;
    expect(payload.paypalLink).toBe("https://paypal.me/x");
    expect(payload.title).toBeUndefined();
    expect(payload.address).toBeUndefined();
    expect(options).toEqual({ merge: true });

    // Local state is updated optimistically
    expect(apartment.value!.paypalLink).toBe("https://paypal.me/x");
    expect(apartment.value!.title).toBe("T");
    expect(apartment.value!.photos).toEqual(["x.jpg"]);
  });

  it("accepts null to clear the PayPal link", async () => {
    const setDocSpy = firestore.setDoc as unknown as ReturnType<typeof vi.fn>;
    const { useApartment } = await import("~/composables/useApartment");
    const { apartment, saveApartment } = useApartment();

    apartment.value = {
      title: "T",
      description: "",
      address: "",
      directions: "",
      rules: "",
      paypalLink: "https://paypal.me/x",
      photos: [],
    };

    await saveApartment({ paypalLink: null });

    const [, payload] = setDocSpy.mock.calls[0]!;
    expect(payload.paypalLink).toBeNull();
    expect(apartment.value!.paypalLink).toBeNull();
  });
});
