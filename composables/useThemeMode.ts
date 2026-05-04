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

export const useThemeMode = () => {
  const theme = useTheme();
  const mode = useState<ThemeMode>("theme-mode", readSavedMode);

  const applyCurrent = () => {
    theme.global.name.value = resolveTheme(mode.value);
  };

  /**
   * Hook up listeners. Idempotent — safe to call multiple times across layouts.
   */
  const init = () => {
    if (import.meta.server) return;
    // Re-read from storage so a value written in another tab (or set after
    // useState was first created) is picked up on the next mount.
    mode.value = readSavedMode();
    applyCurrent();

    // Re-apply when system preference flips, but only if user is in 'auto'
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (mq && !(mq as any).__gardaListenerAttached) {
      mq.addEventListener?.("change", () => {
        if (mode.value === "auto") applyCurrent();
      });
      (mq as any).__gardaListenerAttached = true;
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
    applyCurrent();
  };

  /** The actual theme being rendered right now (resolves 'auto'). */
  const effective = computed<"light" | "dark">(() => resolveTheme(mode.value));

  return { mode, effective, init, setMode };
};
