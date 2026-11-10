# Theme and colours

Besti runs the **shared theme switcher** (`components/theme-switcher/`), the same code as Digito and the other custom Layouts. Its config for Besti is `components/besti/besti-theme.ts`; the one file a merchant edits is `components/besti/besti-theme.settings.ts`.

## On Besti's showcase shop

A **Theme** row sits in the footer, in a strip of its own just above the legal row (since 1.0.16, 10 November 2026; the header has no Theme button):

- **Colour:** Besti blue (the default), Violet, Emerald, Copper, Magenta, and **Custom colour** (a colour wheel that opens the browser's colour picker; the colour is made readable in light and dark, with a note "Adjusted for readability" when it had to change). Six swatches on one line, the chosen one with a ring inside it, and the chosen palette's name.
- **Mode:** a Light / Dark switch (on a phone it wraps under the swatches).

One click changes the whole site at once, with no reload: Besti's colours, the Kalio base, Vuetify's theme and Selldone's own parts (the buy button, prices, the cart drawer, the checkout sheets, dialogs). The choice is kept in the browser and painted before the first paint, so the default never flashes. It works with the keyboard: Tab reaches every swatch, the arrow keys (and Home / End) move along them.

## On your own shop

The visitor switcher is a **showcase** feature: on any shop other than Besti's own showcase shops (Digini 15549, Molino 15645) it is not shown, a saved choice is ignored, and Besti looks exactly as designed. Your theme comes from the settings file:

```ts
export const THEME_SETTINGS: ThemeSettings = {
  palette: "blue",          // "blue" | "violet" | "emerald" | "copper" | "magenta"
  // brandColor: "#F5C400", // any colour; replaces palette
  mode: "light",            // "light" | "dark"
  themeSwitcher: "showcase",// "showcase" | "on" (your visitors get it) | "off"
  textOnBrand: "auto",      // with brandColor: "auto" (a light brand keeps dark words) | "white"
};
```

Examples:

| You want | Set |
| --- | --- |
| A yellow brand | `brandColor: "#F5C400", textOnBrand: "auto"` |
| Your brand colour with white words | `brandColor: "#…", textOnBrand: "white"` (a light colour is darkened) |
| A dark shop | `mode: "dark"` |
| Your visitors choose | `themeSwitcher: "on"` (the Theme row shows in the footer) |
| The original look | remove `brandColor`, `palette: "blue", mode: "light"` |

Then build and upload a new version (see [Build and Upload](Build-and-Upload)) and put it live.

## Contrast

Every palette keeps white button words at 6.3:1 or more (light) and 5:1 or more (dark), the yellow "Deals" at 4.5:1 or more on the department bar, and every link colour at 4.5:1 or more on its ground. A custom or brand colour goes through `paletteFromColor()`, which moves only its lightness until each role reads. In dark mode, product photos keep a white tile so their white edge never shows.

Checks (from the repository root; each must print 0):

```sh
STORAGE='{"besti-theme":"{\"palette\":\"blue\",\"mode\":\"dark\"}"}' \
PAGES="home=/,category=/digital-camera-category,product=/product/709990" \
  node components/theme-switcher/tools/contrast-audit.cjs https://besti.selldone.shop ".b-hero__main"
SHOP=digini-hzgablru STORAGE_KEY=besti-theme WAIT=".b-hero__main" CART=".b-cartpill" \
  node components/theme-switcher/tools/cart-audit.cjs https://besti.selldone.shop blue dark
node components/theme-switcher/theme-color.test.mjs
```
