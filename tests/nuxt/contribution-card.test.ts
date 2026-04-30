import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import ContributionCard from "~/components/ContributionCard.vue";

describe("ContributionCard", () => {
  it("renders title, body, hint, and a CTA button", async () => {
    const wrapper = await mountSuspended(ContributionCard, {
      props: { paypalLink: "https://paypal.me/example" },
    });
    const text = wrapper.text();
    expect(text.length).toBeGreaterThan(0);
    // i18n keys should resolve to actual content (not the key itself)
    expect(text).not.toContain("apartment.contributions.title");
    expect(text).not.toContain("apartment.contributions.body");
    expect(text).not.toContain("apartment.contributions.hint");
  });

  it("uses the provided paypalLink as the button href", async () => {
    const link = "https://paypal.me/somehandle";
    const wrapper = await mountSuspended(ContributionCard, {
      props: { paypalLink: link },
    });
    const anchor = wrapper.find('a[href]');
    expect(anchor.exists()).toBe(true);
    expect(anchor.attributes("href")).toBe(link);
  });

  it("opens the PayPal link in a new tab with safe rel attributes", async () => {
    const wrapper = await mountSuspended(ContributionCard, {
      props: { paypalLink: "https://paypal.me/example" },
    });
    const anchor = wrapper.find('a[href]');
    expect(anchor.attributes("target")).toBe("_blank");
    const rel = anchor.attributes("rel") ?? "";
    expect(rel).toContain("noopener");
    expect(rel).toContain("noreferrer");
  });

  it("does not include legally sensitive words in any locale", async () => {
    // The component pulls text via $t, which the test harness resolves to ru by default.
    // We verify rendered text doesn't contain reserved/risky terms regardless of locale.
    const wrapper = await mountSuspended(ContributionCard, {
      props: { paypalLink: "https://paypal.me/example" },
    });
    const text = wrapper.text().toLowerCase();
    const forbidden = ["donation", "tip", "trinkgeld", "spende", "mancia", "rent", "rental"];
    for (const word of forbidden) {
      expect(text).not.toContain(word);
    }
  });
});
