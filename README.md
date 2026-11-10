<p align="center">
  <img src="docs/screenshots/cover.jpg" alt="Besti Electronics — a white department-store storefront Layout for Selldone, on desktop and phone" width="100%">
</p>

<h1 align="center">Besti Electronics</h1>

<p align="center">
  <b>A big white electronics department store for a Selldone shop.</b><br>
  A custom Selldone Layout built on the official <a href="https://github.com/selldone/storefront">selldone/storefront</a>.
</p>

<p align="center">
  <a href="https://besti.selldone.shop"><img src="https://img.shields.io/badge/live%20shop-besti.selldone.shop-0A4BD8?style=flat-square" alt="Live shop"></a>
  <a href="https://github.com/selldone-custom-layouts/official-besti/wiki"><img src="https://img.shields.io/badge/docs-wiki-071634?style=flat-square" alt="Wiki"></a>
  <a href="https://github.com/selldone-custom-layouts/official-besti/wiki/Install-with-AI"><img src="https://img.shields.io/badge/set%20up-with%20AI-FFD91A?style=flat-square" alt="Set up with AI"></a>
  <img src="https://img.shields.io/badge/Selldone-Layout-2B2F7A?style=flat-square" alt="Selldone Layout">
  <img src="https://img.shields.io/badge/Vue-3-1fc8a9?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue 3">
</p>

<p align="center">
  <a href="https://besti.selldone.shop"><b>Open the live shop</b></a> ·
  <a href="https://github.com/selldone-custom-layouts/official-besti/wiki/Install-with-AI">Set it up with AI</a> ·
  <a href="https://github.com/selldone-custom-layouts/official-besti/wiki/Manual-Setup">Manual setup</a> ·
  <a href="https://github.com/selldone-custom-layouts/official-besti/wiki/Shop-Requirements">What your shop needs</a> ·
  <a href="https://github.com/selldone-custom-layouts">All Selldone custom layouts</a>
</p>

---

## What it is

**Besti Electronics** dresses a single-shop electronics store as a big white department store, after a big-box electronics retailer's sections but in its own look:
- a white page with products in bordered tiles;
- one blue (`#0a4bd8`) for every button, flat, with white words;
- yellow (`#ffd91a`) only as an accent: deal flags, the Deal of the Day, the logo's dot, "Deals";
- sale red for "Save $X", navy for the deal strip and the footer;
- Archivo type and Material Symbols Rounded icons;
- a **Theme** row in the footer on Besti's own showcase shop: five colour palettes (Besti blue, Violet, Emerald, Copper, Magenta), a **Custom colour** and Light / Dark; one click changes the whole site at once, Selldone's own parts too, and the choice stays in the browser.

It runs on **[besti.selldone.shop](https://besti.selldone.shop)**, one address of the Selldone shop Digini. Selldone lets each domain of a shop carry its own Layout.

Selldone's own cart, checkout, payments and orders keep working underneath. Nothing about the shop is hard-coded except the brand name (one line) and the department photos, which are matched to categories by their slug and replaced by a collage of the category's products when missing.

## Highlights

- **Header:** a navy strip with today's deal and "Ends in 364d 23:15:07", counting to the deal's own end date (Selldone's discount dates; no end date, no clock); the wordmark, a search with a department scope, suggestions while typing and a blue search button; Track order, Saved, Sign in, and a blue cart pill with the count and the total. A blue department bar: "All departments" opens a mega menu on a click and closes on a second click, then the live department names, More, Deals in yellow, New arrivals and Brands. On a phone the search spans the screen and the department bar swipes; there is no bottom tab bar.
- **Home:** a photo hero (one slide per department with a wide photo, a white card with "Up to $X off" or "From $Y") beside two photo tiles; **Shop by department** in two even rows (an "All departments" tile fills an odd count); a wide **Deal of the Day**; **Top deals** with department tabs; **Everyday essentials** (one big photo and four); **Best sellers** from the shop's `best-seller` tag; a wide photo banner; **New arrivals**; **Shop by brand** in one row with See all; a row for **every other tag** ("Wireless Items"…); **Recently viewed**; and the four newest **Tips and guides**, last.
- **Cards:** a yellow "% off" flag, colour swatches that pick the colour (its photo, price and stock), capacity chips, a two-line name, the price with a red "Save $X" and "Was $Y", a quiet "Ends in 364d 23:15:07" when the deal has an end date, a blue **Add to cart** that turns into "− n +" in place, "Choose capacity" for a quick-buy sheet with an X, Compare and Save. The same card in every grid, five to a row.
- **Department, search, Deals:** a short head, a filter column built from the products' own specs (departments, price slider with short boxes, On sale only, brand, colour swatches, spec keys), the filters that are on as chips, Sort by.
- **Product page:** three columns: the gallery, the details with colour or capacity **tiles** and key specs, and a **sticky buy box** (price, the deal's countdown in days, hours, minutes and seconds, stock, delivery, Add to cart, Compare, Save); then Specifications in the shop's groups, Reviews, Frequently bought together, Related products and More in the department.
- **Compare:** the picks pinned on top, specs side by side, differences marked, same values merged, "Only differences".
- **Cart:** a receipt-first drawer (subtotal, savings, Checkout, compact rows, "Often added"), a stepped checkout with a map-first address sheet, delivery method and the payment window.
- **Orders and account:** receipt, delivery and the trip, messages with the Besti mark; the account as a **desk** (side menu, order cards, address book).
- **Pages:** guides and articles, About, Terms, Privacy (sample text marked as such until the shop writes its own), Contact us with a form, FAQ and a designed 404.

## Theme and colours

Besti runs the shared theme switcher (`components/theme-switcher/`, the same code as Digito and the other Layouts). On your own shop the visitor switcher is hidden, and Besti shows the theme you set in **one file**, [`components/besti/besti-theme.settings.ts`](components/besti/besti-theme.settings.ts): a palette (`blue`, `violet`, `emerald`, `copper`, `magenta`) or any brand colour (`brandColor: "#F5C400"`; a light colour keeps dark words on it with `textOnBrand: "auto"`), `light` or `dark`, and whether your visitors get the switcher (`themeSwitcher: "showcase" | "on" | "off"`). Every colour is made readable automatically. An AI agent finds the steps in the "Theme" section of [`AGENTS.md`](AGENTS.md); the wiki page [Theme and colours](https://github.com/selldone-custom-layouts/official-besti/wiki/Theme-and-colours) has the details.

## Use it on your shop

| You want to… | Read |
| --- | --- |
| Let an AI agent (Claude Code, Codex…) set it up for your shop | [Install with AI](https://github.com/selldone-custom-layouts/official-besti/wiki/Install-with-AI) |
| Do it yourself, step by step | [Manual Setup](https://github.com/selldone-custom-layouts/official-besti/wiki/Manual-Setup) |
| Know what data your shop needs for the design to look right | [Shop Requirements](https://github.com/selldone-custom-layouts/official-besti/wiki/Shop-Requirements) |
| Build, upload and verify a release | [Build and Upload](https://github.com/selldone-custom-layouts/official-besti/wiki/Build-and-Upload) |
| Put the Layout live on your shop, or on one domain of it | [Go Live](https://github.com/selldone-custom-layouts/official-besti/wiki/Go-Live) |
| Change the name, colours, photos, sections or pages | [Customize](https://github.com/selldone-custom-layouts/official-besti/wiki/Customize) |
| Fix a blank page, a rejected upload or an old version showing | [Troubleshooting](https://github.com/selldone-custom-layouts/official-besti/wiki/Troubleshooting) |

The wiki's source is also in [`docs/wiki/`](docs/wiki/).

## Quick start (developers)

```bash
git clone --recurse-submodules https://github.com/selldone-custom-layouts/official-besti.git
cd official-besti
npm install --force
npm run serve            # dev server on http://localhost:9131
```

Releases: `bash scripts/release.sh <new-version> desk`. See [Build and Upload](https://github.com/selldone-custom-layouts/official-besti/wiki/Build-and-Upload).

## Where things are

| Area | Files |
| --- | --- |
| The brand name (one line) and the mark | [`components/kalio/kalio-brand.ts`](components/kalio/kalio-brand.ts), [`assets/brand/`](assets/brand/) |
| Header, footer, home, card, product page | [`components/besti/`](components/besti/) |
| Department photos (by category slug) | [`assets/besti/`](assets/besti/) |
| Besti's dress | [`style/besti.scss`](style/besti.scss), [`style/besti-pages.scss`](style/besti-pages.scss) |
| What Besti changed, and why | [`BESTI.md`](BESTI.md) |
| The behaviours it keeps (cart, checkout, account…) | [`components/kalio/`](components/kalio/), [`KALIO.md`](KALIO.md) |
| Release tooling | [`scripts/`](scripts/) |
| Selldone storefront's original README | [`README.selldone.md`](README.selldone.md) |

Besti started from [Walio Market](https://github.com/selldone-custom-layouts/official-walio) and keeps its shared components (classes `k-`, `t-`, `w-`); Besti's own are `b-`.

## Credits and license

Built on the official [Selldone Storefront](https://github.com/selldone/storefront) (MIT License, © Selldone); see [`LICENSE.md`](LICENSE.md). Part of **[Selldone Custom Layouts](https://github.com/selldone-custom-layouts)**.
