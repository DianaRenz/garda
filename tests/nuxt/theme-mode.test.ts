import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref, computed } from "vue";

// Mock Vuetify's useTheme with a reactive theme that tracks .name and
// derives .current.value.dark from it — same shape as real Vuetify so
// the `effective` computed in useThemeMode actually reacts to changes.
const themeName = ref<"light" | "dark">("light");
vi.mock("vuetify", () => ({
  useTheme: () => ({
    global: {
      name: themeName,
      current: computed(() => ({ dark: themeName.value === "dark" })),
    },
  }),
}));

import { resolveTheme, __resetForTests } from "~/composables/useThemeMode";

const STORAGE_KEY = "garda.theme";

type MqListener = (e: { matches: boolean }) => void;

const mockMatchMedia = (initialDark: boolean) => {
  let currentDark = initialDark;
  const listeners: MqListener[] = [];
  vi.stubGlobal("matchMedia", (query: string) => ({
    // Use a getter so subsequent calls to matchMedia(...).matches reflect
    // the latest state — important because resolveTheme() reads matchMedia
    // freshly each time it's called.
    get matches() {
      return query.includes("dark") ? currentDark : false;
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, cb: MqListener) => listeners.push(cb),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  return {
    fireChange: (matches: boolean) => {
      currentDark = matches;
      listeners.forEach((cb) => cb({ matches }));
    },
  };
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
  beforeEach(async () => {
    vi.unstubAllGlobals();
    localStorage.clear();
    __resetForTests();
    themeName.value = "light";
    // useState('theme-mode') is shared across tests in the Nuxt test runtime,
    // so we must explicitly reset its value or earlier tests will leak through.
    mockMatchMedia(false);
    const { useThemeMode } = await import("~/composables/useThemeMode");
    useThemeMode().setMode("auto");
    localStorage.clear(); // setMode('auto') doesn't write, but be safe if internal logic changes
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
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { mode, setMode } = useThemeMode();
    setMode("dark");
    expect(mode.value).toBe("dark");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
  });

  it("setMode('auto') removes the stored key (so future installs default to system)", async () => {
    localStorage.setItem(STORAGE_KEY, "dark");
    mockMatchMedia(false);
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
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { mode, setMode } = useThemeMode();
    setMode("dark");
    expect(mode.value).toBe("dark"); // in-memory still works
    setItem.mockRestore();
  });

  it("effective.value reflects auto mode + system dark preference", async () => {
    mockMatchMedia(true); // system prefers dark
    themeName.value = "dark"; // simulate plugin having booted with dark
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { effective, mode } = useThemeMode();
    expect(mode.value).toBe("auto");
    expect(effective.value).toBe("dark");
  });

  it("effective.value follows system light preference in auto mode", async () => {
    mockMatchMedia(false);
    themeName.value = "light";
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { effective } = useThemeMode();
    expect(effective.value).toBe("light");
  });

  it("effective.value ignores system preference once user picks light explicitly", async () => {
    mockMatchMedia(true); // system prefers dark — but user explicitly chose light
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { effective, setMode } = useThemeMode();
    setMode("light");
    expect(effective.value).toBe("light");
  });

  // Regression test for the bug where `effective` was a stale computed
  // because it called systemPrefersDark() (non-reactive) inside the
  // computed body. The matchMedia listener would update Vuetify's theme
  // directly but `effective` would lag behind, leaving ThemeMenu's icon
  // wrong until something else triggered a re-render.
  it("effective.value updates when system preference flips while in auto mode", async () => {
    const mq = mockMatchMedia(false);
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { effective, init } = useThemeMode();
    init();
    expect(effective.value).toBe("light");

    // Simulate OS theme flip to dark
    mq.fireChange(true);

    expect(effective.value).toBe("dark");
  });

  it("does not re-apply theme on system change when user picked an explicit mode", async () => {
    const mq = mockMatchMedia(false);
    const { useThemeMode } = await import("~/composables/useThemeMode");
    const { effective, init, setMode } = useThemeMode();
    init();
    setMode("light");
    expect(effective.value).toBe("light");

    // System flips to dark — but user chose light explicitly, so we stay light
    mq.fireChange(true);

    expect(effective.value).toBe("light");
  });
});
