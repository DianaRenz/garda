import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    include: ["tests/**/*.{test,spec}.ts"],
    setupFiles: ["./tests/setup.ts"],
  },
});
