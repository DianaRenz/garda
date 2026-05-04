import { useTheme } from "vuetify";

export type ThemeMode = "light" | "dark" | "auto";

const STORAGE_KEY = "garda.theme";

const readSavedMode = (): ThemeMode => {
  if (import.meta.server) return "auto";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "auto") return v;
  } catch {
    /* localStorage unavailable */
  }
  return "auto";
};

const systemPrefersDark = (): boolean => {
  if (import.meta.server || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Resolve a ThemeMode into the actual Vuetify theme name to apply.
 * Exported for tests and the Vuetify plugin pre-boot resolution.
 */
export const resolveTheme = (mode: ThemeMode): "light" | "dark" => {
  if (mode === "auto") return systemPrefersDark() ? "dark" : "light";
  return mode;
};

// Module-level — the matchMedia listener should attach exactly once
// per browser session, regardless of how many components call init().
let mqListenerAttached = false;

export const useThemeMode = () => {
  const theme = useTheme();
  const mode = useState<ThemeMode>("theme-mode", readSavedMode);

  const applyCurrent = () => {
    theme.global.name.value = resolveTheme(mode.value);
  };

  // Single source of truth: any time `mode` changes, theme reflects it.
  // Guards against direct mutations (devtools, cross-tab, etc.) bypassing setMode.
  watch(mode, applyCurrent);

  /**
   * Sync state with storage, apply the theme, and start listening for
   * system preference changes. Idempotent: safe to call from multiple
   * mount points (the matchMedia listener attaches only once per session).
   */
  const init = () => {
    if (import.meta.server) return;
    // Re-read from storage so a value written in another tab (or set after
    // useState was first created) is picked up on the next mount.
    mode.value = readSavedMode();
    applyCurrent();

    if (!mqListenerAttached) {
      const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
      mq?.addEventListener?.("change", () => {
        if (mode.value === "auto") applyCurrent();
      });
      mqListenerAttached = true;
    }
  };

  const setMode = (next: ThemeMode) => {
    mode.value = next;
    try {
      if (next === "auto") {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      /* localStorage unavailable — choice persists in memory only */
    }
  };

  /** The actual theme being rendered right now (resolves 'auto'). */
  const effective = computed<"light" | "dark">(() => resolveTheme(mode.value));

  return { mode, effective, init, setMode };
};
