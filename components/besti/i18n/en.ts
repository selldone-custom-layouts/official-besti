/*
 * Besti's own words, in English (the shop's first language). Another
 * language is a file beside this one with the same keys (da.ts…), added to
 * index.ts when the owner enables that language in the shop; a missing key
 * falls back to English. Use them through t() from the region switcher:
 *   import { t } from "../../region-switcher/region";
 *   {{ t("header.track") }}
 */
export const en: Record<string, string> = {
  // The region switcher (header pill and panel, phone menu row and sheet)
  "region.title": "Language & currency",
  "region.language": "Language",
  "region.currency": "Currency",
  "region.done": "Done",
  "region.close": "Close",
  "region.note": "Prices everywhere change at once: cards, filters, cart and checkout.",

  // Header
  "header.track": "Track order",
  "header.saved": "Saved",
  "header.signIn": "Sign in",
  "header.account": "Account",
  "header.cart": "Cart",
  "header.search": "What can we help you find?",
  "header.searchIn": "Search in",
  "header.all": "All",
  "header.allDepartments": "All departments",
  "header.more": "More",
  "header.deals": "Deals",
  "header.new": "New arrivals",
  "header.brands": "Brands",
  "header.dealOfDay": "Deal of the Day",
  "header.shopDeal": "Shop the deal",

  // The departments menu
  "menu.showMore": "Show {n} more",
  "menu.showFewer": "Show fewer",
  "menu.todaysDeals": "Today’s deals",
  "menu.allProducts": "All products",
  "menu.trackOrder": "Track an order",
};
