/*
 * Besti — the theme switcher's config (the footer's "Theme" row; the
 * owner's rules of 9 November 2026: colour palettes and Light / Dark, a click
 * changes the whole site; "the same in every Layout": Besti runs the shared
 * switcher, components/theme-switcher/; 10 November 2026: in the footer, not
 * the header).
 *
 * This file is everything Besti-specific: its five palettes, which Besti
 * variables each palette value feeds (the Kalio base reads Besti's: --k-green
 * is var(--b-blue) in kalio-tokens.scss), the dark token set, and Vuetify's
 * dark surfaces. storefront.ts calls bootThemeSwitcher(BESTI_THEME, vuetify)
 * before mounting, so the chosen theme paints first, with no flash. The
 * merchant's choice is in besti-theme.settings.ts.
 *
 * Contrast (WCAG 2.1, measured 9 November 2026): white on each light primary
 * (buttons, and the department bar in both modes) — blue 6.97, violet 7.10,
 * emerald 6.71, copper 6.65, magenta 6.32; the yellow "Deals" on it 5.05,
 * 5.14, 4.86, 4.81, 4.57. White on each dark primary (buttons on dark cards)
 * — 5.17, 5.31, 5.48, 5.02, 5.25, each 3:1 or more against the dark card
 * #151c2b; each dark "text" colour on that card 7.97 or more.
 */
import type { ThemeSwitcherConfig } from "../theme-switcher/theme-switcher";
import { t } from "../kalio/i18n/kalio-i18n";
import { THEME_SETTINGS } from "./besti-theme.settings";

/* A dark band of a colour's hue (the deal strip, the footer): the colour
   mixed toward black. */
function shade(hex: string, keep: number): string {
  const h = hex.replace("#", "");
  const c = [0, 2, 4].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * keep));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

export const BESTI_THEME: ThemeSwitcherConfig = {
  /* The merchant's choice: besti-theme.settings.ts, the one file to edit. */
  settings: THEME_SETTINGS,

  /* The owner (9 November 2026): a merchant who imports Besti into their own
     shop must not see the switcher. With themeSwitcher "showcase" it shows
     only on these shops (window.shop.id, else <meta name="shop-name">). */
  showcaseShops: [
    { id: 15549, name: "digini-hzgablru" }, // Digini: Digito, Besti
    { id: 15645, name: "molino" }, // Molino: Molino, Tario, Walio, Dino, Valero
  ],

  storageKey: "besti-theme",
  darkClass: "b-dark",

  palettes: [
    {
      id: "blue",
      get name() {
        return t("besti.palette.blue", "Besti blue");
      },
      light: { primary: "#0a4bd8", deep: "#0838a8", soft: "#e8efff", onPrimary: "#ffffff", text: "#0a4bd8", navy: "#071634", navy2: "#0e2350", pop: "#ffd91a" },
      dark: { primary: "#2563eb", deep: "#1d4ed8", soft: "#18294f", onPrimary: "#ffffff", text: "#8fb0ff" },
    },
    {
      id: "violet",
      get name() {
        return t("besti.palette.violet", "Violet");
      },
      light: { primary: "#6d28d9", deep: "#5b21b6", soft: "#f1ebfe", onPrimary: "#ffffff", text: "#6d28d9", navy: "#1c0f3a", navy2: "#2a1856", pop: "#ffd91a" },
      dark: { primary: "#8042f0", deep: "#6d28d9", soft: "#2a1a4d", onPrimary: "#ffffff", text: "#c4a8ff" },
    },
    {
      id: "emerald",
      get name() {
        return t("besti.palette.emerald", "Emerald");
      },
      light: { primary: "#03694c", deep: "#04543d", soft: "#e3f6ee", onPrimary: "#ffffff", text: "#03694c", navy: "#062a20", navy2: "#0b3d2f", pop: "#ffd91a" },
      dark: { primary: "#047857", deep: "#065f46", soft: "#0f3a2e", onPrimary: "#ffffff", text: "#5fd3a5" },
    },
    {
      id: "copper",
      get name() {
        return t("besti.palette.copper", "Copper");
      },
      light: { primary: "#9a4207", deep: "#7c3506", soft: "#fdf0e3", onPrimary: "#ffffff", text: "#9a4207", navy: "#2a1607", navy2: "#3d220d", pop: "#ffd91a" },
      dark: { primary: "#b45309", deep: "#92400e", soft: "#3d2410", onPrimary: "#ffffff", text: "#f5b36b" },
    },
    {
      id: "magenta",
      get name() {
        return t("besti.palette.magenta", "Magenta");
      },
      light: { primary: "#a21caf", deep: "#86198f", soft: "#fbe9fc", onPrimary: "#ffffff", text: "#a21caf", navy: "#2a0b2e", navy2: "#3d1243", pop: "#ffd91a" },
      dark: { primary: "#b521c6", deep: "#a21caf", soft: "#3d1342", onPrimary: "#ffffff", text: "#f0a6f7" },
    },
  ],

  /* Palette value -> the variables that carry it. --b-head (the department
     bar and the newsletter band) keeps the light primary in both modes, with
     --b-on-head words and the --b-pop accent; --b-on-brand is the words on a
     brand-coloured button (dark on a light merchant brand, textOnBrand "auto"). */
  tokens: {
    "--b-blue": "primary",
    "--b-blue-d": "deep",
    "--b-blue-l": "soft",
    "--b-blue-t": "text",
    "--b-blue-rgb": "primary:rgb",
    "--b-head": "light.primary",
    "--b-head-d": "light.deep",
    "--b-on-head": "light.onPrimary",
    "--b-on-head-rgb": "light.onPrimary:rgb",
    "--b-navy": "light.navy",
    "--b-navy-2": "light.navy2",
    "--b-pop": "light.pop",
    "--b-on-brand": "onPrimary",
    "--b-on-brand-rgb": "onPrimary:rgb",
  },

  /* While dark (removed on light). Packshot tiles (--b-photo, --k-well,
     --k-tint) stay white, so a white packshot keeps its edge hidden. */
  dark: {
    "--b-bg": "#0c111b",
    "--b-surface": "#151c2b",
    "--b-page": "#1c2536",
    "--b-line": "#2b3549",
    "--b-line-2": "#3d4961",
    "--b-hover-line": "#55627c",
    "--b-deco": "#75819a",
    "--b-ink": "#e8ecf3",
    "--b-ink-2": "#d3d9e4",
    "--b-brand-ink": "#e8ecf3",
    "--b-muted": "#a6b0c2",
    "--b-soft": "#8d98ac",
    "--b-off-bg": "#2b3549",
    "--b-off-ink": "#b3bccc",
    "--b-red-t": "#ff8193",
    "--b-green-t": "#4fd18b",
    "--b-warn-t": "#ffb366",
    "--b-yellow-l": "#3a3312",
    "--b-sw-edge": "rgba(255, 255, 255, 0.55)",
    "--b-pop-shadow": "rgba(0, 0, 0, 0.6)",
    "--k-line-soft": "#222b3d",
    "--k-coral-soft": "#3a1820",
    "--k-star-off": "#75819a",
    "--k-plain": "#151c2b",
    "--k-shadow": "0 10px 28px -14px rgba(0, 0, 0, 0.7)",
  },

  vuetify: {
    light: "light",
    dark: "dark",
    paletteColors: { primary: "primary", "on-primary": "onPrimary" },
    darkColors: {
      background: "#0c111b",
      surface: "#151c2b",
      "surface-bright": "#1c2536",
      "surface-variant": "#2b3549",
      "on-background": "#e8ecf3",
      "on-surface": "#e8ecf3",
      "on-surface-variant": "#d3d9e4",
      "on-primary": "#ffffff",
      secondary: "#e8ecf3",
      "on-secondary": "#0c111b",
      error: "#ff8193",
      info: "#8fb0ff",
      success: "#4fd18b",
      warning: "#ffb366",
    },
  },

  metaThemeColor: "light.primary",
  ui: { ink: "var(--b-ink)", muted: "var(--b-muted)", line: "var(--b-line)", surface: "var(--b-surface)", font: '"Archivo", system-ui, sans-serif' },
  /* Getters: the words follow the visitor's language (Besti 1.0.21). */
  labels: {
    get theme() {
      return t("theme.title", "Theme");
    },
    get palettes() {
      return t("theme.palettes", "Colour");
    },
    get mode() {
      return t("theme.mode", "Light or dark");
    },
    get modeTitle() {
      return t("theme.modeTitle", "Mode");
    },
    get light() {
      return t("theme.light", "Light");
    },
    get dark() {
      return t("theme.dark", "Dark");
    },
    get custom() {
      return t("theme.custom", "Custom colour");
    },
    get adjusted() {
      return t("theme.adjusted", "Adjusted for readability");
    },
    get brand() {
      return t("theme.brand", "Brand colour");
    },
  },

  /* "Custom colour" (the owner, 9 November 2026): any colour, made readable by
     paletteFromColor(). The department bar carries white words and the yellow
     "Deals" on the light primary, so white on it must reach 6.5:1 (yellow
     then reads 4.6:1). The deal strip and the footer take a dark band of the
     colour's hue. */
  custom: {
    headerContrast: 6.5,
    darkSurfaces: ["#0c111b", "#151c2b", "#1c2536"],
    lightSurfaces: ["#ffffff", "#f0f2f5"],
    darkText: "#0f1729",
    extras: (v) => ({
      navy: shade(v.primary, 0.16),
      navy2: shade(v.primary, 0.28),
      pop: v.onPrimary === "#ffffff" ? "#ffd91a" : v.onPrimary,
    }),
  },
};
