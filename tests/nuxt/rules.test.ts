import { describe, it, expect } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

mockNuxtImport("useI18n", () => () => ({
  t: (key: string) => key,
}));

import { useFormRules } from "~/composables/rules";

describe("useFormRules", () => {
  describe("ruleRequired", () => {
    it("passes for non-empty strings", () => {
      const { ruleRequired } = useFormRules();
      expect(ruleRequired("hello")).toBe(true);
    });

    it("passes for non-zero numbers and true", () => {
      const { ruleRequired } = useFormRules();
      expect(ruleRequired(42)).toBe(true);
      expect(ruleRequired(true)).toBe(true);
    });

    it("returns an error message for empty string, null, undefined, 0, false", () => {
      const { ruleRequired } = useFormRules();
      for (const v of ["", null, undefined, 0, false]) {
        const result = ruleRequired(v);
        expect(typeof result).toBe("string");
        expect(result).not.toBe("");
      }
    });
  });

  describe("ruleEmail", () => {
    it("passes for valid emails", () => {
      const { ruleEmail } = useFormRules();
      const valid = [
        "test@example.com",
        "user.name+tag@example.co.uk",
        "a@b.io",
        "first.last@sub.domain.org",
      ];
      for (const email of valid) {
        expect(ruleEmail(email)).toBe(true);
      }
    });

    it("returns an error message for invalid emails", () => {
      const { ruleEmail } = useFormRules();
      const invalid = [
        "no-at-sign",
        "missing@tld",
        "@nouser.com",
        "spaces in@email.com",
        "double@@example.com",
        "trailing.dot.@example.com",
        "",
      ];
      for (const email of invalid) {
        const result = ruleEmail(email);
        expect(typeof result).toBe("string");
        expect(result).not.toBe("");
      }
    });
  });

  describe("rulePassLen", () => {
    it("passes for passwords with 6+ chars", () => {
      const { rulePassLen } = useFormRules();
      expect(rulePassLen("123456")).toBe(true);
      expect(rulePassLen("a-very-long-password")).toBe(true);
    });

    it("returns an error message for short or empty passwords", () => {
      const { rulePassLen } = useFormRules();
      for (const v of ["", "a", "12345"]) {
        const result = rulePassLen(v);
        expect(typeof result).toBe("string");
        expect(result).not.toBe("");
      }
    });
  });
});
