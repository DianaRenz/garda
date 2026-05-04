import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("vuetify", () => ({
  useTheme: () => ({
    global: { name: { value: "light" } },
  }),
}));

import { resolveTheme } from "~/composables/useThemeMode";

const STORAGE_KEY = "garda.theme";

const mockMatchMedia = (matchesDark: boolean) => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("dark") ? matchesDark : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe("resolveTheme", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("returns the literal mode for explicit choices", () => {
    mockMatchMedia(false);
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("follows system preference (dark) when in auto mode", () => {
    mockMatchMedia(true);
    expect(resolveTheme("auto")).toBe("dark");
  });

  it("falls back to light when in auto mode and system prefers light", () => {
    mockMatchMedia(false);
    expect(resolveTheme("auto")).toBe("light");
  });
});

describe("useThemeMode", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("defaults to 'auto' when nothing is stored", async () => {
    mockMatchMedia(false);
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { mode } = useThemeMode();
    expect(mode.value).toBe("auto");
  });

  it("init() picks up stored 'dark' from localStorage", async () => {
    localStorage.setItem(STORAGE_KEY, "dark");
    mockMatchMedia(false);
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { mode, init } = useThemeMode();
    init();
    expect(mode.value).toBe("dark");
  });

  it("init() ignores invalid stored values and falls back to 'auto'", async () => {
    localStorage.setItem(STORAGE_KEY, "purple");
    mockMatchMedia(false);
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { mode, init } = useThemeMode();
    init();
    expect(mode.value).toBe("auto");
  });

  it("setMode('dark') persists to localStorage and updates state", async () => {
    mockMatchMedia(false);
    vi.resetModules();
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { mode, setMode } = useThemeMode();
    setMode("dark");
    expect(mode.value).toBe("dark");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
  });

  it("setMode('auto') removes the stored key (so future installs default to system)", async () => {
    localStorage.setItem(STORAGE_KEY, "dark");
    mockMatchMedia(false);
    vi.resetModules();
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { setMode } = useThemeMode();
    setMode("auto");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("does not crash if localStorage throws on setItem", async () => {
    mockMatchMedia(false);
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });
    vi.resetModules();
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { mode, setMode } = useThemeMode();
    setMode("dark");
    expect(mode.value).toBe("dark"); // in-memory still works
    setItem.mockRestore();
  });

  it("effective.value reflects auto mode + system preference", async () => {
    mockMatchMedia(true); // system prefers dark
    vi.resetModules();
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { effective } = useThemeMode();
    expect(effective.value).toBe("dark");
  });
});
