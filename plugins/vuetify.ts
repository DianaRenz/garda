import { createVuetify } from "vuetify";

// Resolve the initial theme synchronously, before Vuetify boots,
// so users with a saved 'dark' preference (or system dark mode) don't see
// a flash of light theme on first paint.
const resolveInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return LIGHT_THEME;
  try {
    const saved = localStorage.getItem("garda.theme");
    if (saved === "light") return LIGHT_THEME;
    if (saved === "dark") return DARK_THEME;
  } catch {
    /* localStorage unavailable */
  }
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return DARK_THEME;
  return LIGHT_THEME;
};

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    ssr: true,
    defaults,
    // add theme
    theme: {
      defaultTheme: resolveInitialTheme(),
      themes: {
        light,
        dark,
      },
    },
    // Add the custom iconset
    icons: {
      defaultSet: "custom",
      aliases,
      sets: {
        custom,
      },
    },
  });

  app.vueApp.use(vuetify);
});
