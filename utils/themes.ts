import type { ThemeDefinition } from "vuetify";

// String that represents the name of the theme I am using
export const LIGHT_THEME = "light";
// Light mode theme
export const light: ThemeDefinition = {
  dark: false,
  colors: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    "surface-variant": twColors.slate[50],
    primary: twColors.indigo[600],
    secondary: twColors.purple[600],
    error: twColors.red[500],
    info: twColors.blue[500],
    success: twColors.emerald[500],
    warning: twColors.amber[600],
  },
};

// String that represents the name of the dark theme I am using
export const DARK_THEME = "dark";
// Dark mode theme
export const dark: ThemeDefinition = {
  dark: true,
  colors: {
    background: twColors.slate[950],
    surface: twColors.slate[900],
    "surface-variant": twColors.slate[800],
    primary: twColors.indigo[400],
    secondary: twColors.purple[400],
    error: twColors.red[400],
    info: twColors.blue[400],
    success: twColors.emerald[400],
    warning: twColors.amber[400],
  },
};
