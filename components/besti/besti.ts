import { currentCurrency, formatMoney } from "../region-switcher/region";
import { t } from "../kalio/i18n/kalio-i18n";
/*
 * Besti — shared reads and helpers for the department-store pages.
 *
 * Nothing here names a product, a price, a category or a tag. The only
 * shop-specific things in the Layout are the brand line (kalio-brand.ts)
 * and the lifestyle photos, which are matched to a category by its `name`
 * slug (assets/besti/<shape>-<slug>.webp). A category without a photo gets a
 * collage of its own products wherever a photo would go (BestiPhoto.vue).
 *
 *  - catalogue(): one read of the shop's product list (products/list), kept
 *    for the visit. It carries what the card and the home need and the
 *    lighter /products/all does not: brand, created_at, spec and the
 *    variants with their ids, prices and stock.
 *  - tagged(): the shop's live product tags and their products. Selldone has
 *    no "list the tags" call, but a product found by one tag comes back with
 *    all of its tags, so a few seed words find the products and those
 *    products name every other tag in use; each round asks for the tags not
 *    yet read (two or three calls in all). A tag with no products is never
 *    found, so it shows nothing; a new tag on any tagged product makes its
 *    own "<Tag> Items" section without a code change.
 */

import { reactive } from "vue";
import { PriceHelper } from "@selldone/core-js";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { percentOff, priceOf } from "../kalio/kalio-catalog";

declare const window: any;

/* ━━━━━━━━━━━━ Lifestyle photos ━━━━━━━━━━━━
   wide (16:9, a quiet left third for words), portrait (4:5) and square.
   import.meta.glob lists only the files that exist at build time. */
const FILES = import.meta.glob("../../assets/besti/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const BY_NAME = new Map<string, string>(
  Object.entries(FILES).map(([path, url]) => [path.split("/").pop()!.replace(/\.\w+$/, ""), url]),
);

export type Shape = "wide" | "portrait" | "square";

export interface Photo {
  src: string;
  srcset: string | null;
}

/** The category's photo of this shape, or null (then a collage stands in). */
export function photoOf(category: any, shape: Shape): Photo | null {
  const slug = category?.name;
  if (!slug) return null;
  const src = BY_NAME.get(`${shape}-${slug}`);
  if (!src) return null;
  const small = BY_NAME.get(`${shape}-${slug}-800`);
  return { src, srcset: small ? `${small} 800w, ${src} 1600w` : null };
}

/** The categories that have a photo of this shape, in the shop's order. */
export function withPhoto(list: any[], shape: Shape): any[] {
  return list.filter((c) => photoOf(c, shape));
}

/* ━━━━━━━━━━━━ The catalogue, read once ━━━━━━━━━━━━ */

let catalogueRead: Promise<any[]> | null = null;

export function catalogue(): Promise<any[]> {
  if (!catalogueRead) {
    catalogueRead = window.axios
      .get(window.XAPI.GET_PRODUCTS_LIST(window.$storefront.name), { params: { offset: 0, limit: 250 } })
      .then(({ data }: any) => (data?.products || []).filter((p: any) => p && p.id && p.icon))
      .catch(() => {
        catalogueRead = null;
        return [];
      });
  }
  return catalogueRead!;
}

export function catalogueById(): Promise<Map<number, any>> {
  return catalogue().then((list) => new Map(list.map((p) => [p.id, p])));
}

/* ━━━━━━━━━━━━ Tags ━━━━━━━━━━━━ */

/* Where discovery starts: the words shops tag merchandising with. Any other
   tag on a product found this way is found too. */
const SEEDS = [
  "best-seller", "bestseller", "best-sellers", "bestsellers", "best seller",
  "new-arrival", "new-arrivals", "new arrival", "new", "featured", "trending",
  "popular", "sale", "hot", "top", "limited", "exclusive", "gift",
];

let taggedRead: Promise<Map<string, any[]>> | null = null;

function byTags(tags: string[]): Promise<any[]> {
  const params = new URLSearchParams();
  params.set("offset", "0");
  params.set("limit", "250");
  for (const t of tags) params.append("tags[]", t);
  return window.axios
    .get(`${window.XAPI.GET_PRODUCTS(window.$storefront.name)}?${params.toString()}`)
    .then(({ data }: any) => data?.products || [])
    .catch(() => []);
}

/** Tag → its products (with the catalogue's richer record when there is one). */
export function tagged(): Promise<Map<string, any[]>> {
  if (!taggedRead) {
    taggedRead = (async () => {
      const asked = new Set<string>();
      const found = new Map<number, any>();
      let next = SEEDS.slice();
      for (let round = 0; round < 4 && next.length; round++) {
        next.forEach((t) => asked.add(t.toLowerCase()));
        const list = await byTags(next);
        const fresh = new Set<string>();
        for (const p of list) {
          found.set(p.id, p);
          for (const t of p.tags || []) if (!asked.has(String(t).toLowerCase())) fresh.add(String(t));
        }
        next = [...fresh];
      }
      const rich = await catalogueById();
      const out = new Map<string, any[]>();
      for (const p of found.values()) {
        for (const t of p.tags || []) {
          if (!out.has(t)) out.set(t, []);
          out.get(t)!.push({ ...(rich.get(p.id) || p), tags: p.tags });
        }
      }
      return out;
    })().catch(() => {
      taggedRead = null;
      return new Map();
    });
  }
  return taggedRead!;
}

export const isBestSellerTag = (t: string) => /best[\s_-]*sell/i.test(t);
export const isNewTag = (t: string) => /^new$|new[\s_-]*arriv/i.test(t);

/** "best-seller" → "Best Seller", "4k" → "4K", "wireless" → "Wireless". */
export function tagTitle(tag: string): string {
  return String(tag)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => (/\d/.test(w) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

/* ━━━━━━━━━━━━ Category tiles: two even rows, never a hole ━━━━━━━━━━━━
   The owner's rule (9 November 2026): n ≥ 16 shows the first 15 and an
   "All departments" tile; an odd n shows all and the tile; an even n shows
   all. Columns = tiles / 2. */
export function catTiles(list: any[], max = 16): { cats: any[]; all: boolean; cols: number } {
  const n = list.length;
  const cats = list.slice(0, n >= max ? max - 1 : n);
  const all = cats.length < n || cats.length % 2 === 1;
  return { cats, all, cols: Math.max(1, (cats.length + (all ? 1 : 0)) / 2) };
}

/* ━━━━━━━━━━━━ Prices ━━━━━━━━━━━━ */

export interface Money {
  now: number;
  was: number | null;
  save: number;
}

/** A product's (or one variant's) price now, before, and the saving. */
export function moneyOf(shop: any, product: any, variant: any, currency: string): Money {
  if (!variant) {
    const p = priceOf(shop, product, currency);
    return { now: p.now, was: p.was, save: p.was ? p.was - p.now : 0 };
  }
  try {
    const now = PriceHelper.priceProductByCurrency(shop, product, variant, currency as any);
    const off = PriceHelper.getProductDiscountAmountByCurrency(shop, product, variant, currency as any) || 0;
    return { now, was: off > 0 ? now + off : null, save: off > 0 ? off : 0 };
  } catch {
    return moneyOf(shop, product, null, currency);
  }
}

export { percentOff };

/** Deals, biggest saving (in percent) first. */
export function dealsOf(shop: any, list: any[]): any[] {
  return list
    .map((p) => ({ p, off: percentOff(shop, p) }))
    .filter((x) => x.off > 0 && x.p.quantity > 0)
    .sort((a, b) => b.off - a.off || a.p.id - b.p.id)
    .map((x) => x.p);
}

/** Today's deal: one of the biggest savings, a different one each day. */
export function dealOfTheDay(shop: any, list: any[]): any | null {
  const deals = dealsOf(shop, list).slice(0, 3);
  if (!deals.length) return null;
  const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
  return deals[day % deals.length];
}

/** Round-robin across categories, so no section is all one kind. */
export function mixByCategory(list: any[], n: number): any[] {
  const groups = new Map<any, any[]>();
  for (const p of list) {
    if (!groups.has(p.category_id)) groups.set(p.category_id, []);
    groups.get(p.category_id)!.push(p);
  }
  const out: any[] = [];
  const qs = [...groups.values()];
  while (out.length < n && qs.some((q) => q.length)) for (const q of qs) if (q.length && out.length < n) out.push(q.shift());
  return out;
}

/** "Up to $90 off" when the category has deals, else "From $6.59". */
export function categoryLine(shop: any, list: any[], categoryId: number, currency: string, money: (n: number) => string): string {
  const ps = list.filter((p) => p.category_id === categoryId);
  if (!ps.length) return "";
  const best = Math.max(0, ...ps.map((p) => moneyOf(shop, p, null, currency).save));
  if (best > 0) return t("besti.upToOff", "Up to {amount} off", { amount: money(Math.round(best)) });
  return t("besti.from", "From {amount}", { amount: money(Math.min(...ps.map((p) => moneyOf(shop, p, null, currency).now))) });
}

/** Brands by how many products carry them. */
export function brandsOf(list: any[]): string[] {
  const n = new Map<string, number>();
  for (const p of list) if (p.brand) n.set(p.brand, (n.get(p.brand) || 0) + 1);
  return [...n.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([b]) => b);
}

/* ━━━━━━━━━━━━ Recently viewed (this browser only) ━━━━━━━━━━━━ */

const RECENT_KEY = "besti:recent";

export function rememberViewed(productId: number): void {
  try {
    const list: number[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").filter((id: number) => id !== productId);
    list.unshift(productId);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 12)));
  } catch {
    /* private window: nothing remembered */
  }
}

export function viewedIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function forgetViewed(): void {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    /* nothing */
  }
}

/* ━━━━━━━━━━━━ Saved (Selldone's wishlist) ━━━━━━━━━━━━ */

export const saved = reactive<Record<number, boolean>>({});

export function toggleSaved(vm: any, product: any): Promise<void> {
  if (!vm.USER()) {
    // The app's own sign-in event (KalioSignIn listens). Cards have no AuthMixin,
    // so vm.NeedLogin() threw "is not a function" and a guest's heart did nothing.
    EventBus.$emit("need-login", true);
    return Promise.resolve();
  }
  const on = saved[product.id] ?? !!product.wishlist;
  const shop = window.$storefront.name;
  saved[product.id] = !on;
  const call = on
    ? window.axios.delete(window.XAPI.DELETE_WISHLIST_PRODUCT(shop, product.id))
    : window.axios.put(window.XAPI.PUT_WISHLIST_PRODUCT(shop, product.id));
  return call
    .then(({ data }: any) => {
      if (data?.error) saved[product.id] = on;
    })
    .catch(() => {
      saved[product.id] = on;
    });
}

/* ━━━━━━━━━━━━ Variants ━━━━━━━━━━━━ */

/** What makes two variant records the same choice (ids are not in every list). */
export function variantKey(v: any): string {
  return ["color", "volume", "weight", "pack", "type", "style"].map((k) => String(v?.[k] || "").toLowerCase()).join("|");
}

/** "#a/#b" two-tone colours, with or without alpha. */
export function swatchBg(color: string): string {
  const parts = String(color || "")
    .split("/")
    .filter(Boolean)
    .map((c) => (c.length === 9 ? c.slice(0, 7) : c));
  if (parts.length > 1) return `linear-gradient(135deg, ${parts[0]} 50%, ${parts[1]} 50%)`;
  return parts[0] || "#ccc";
}

/** The dimension a product's variants differ in, in a shopper's word. */
export function variantDimension(variants: any[]): { key: string; word: string } | null {
  if (!variants || !variants.length) return null;
  const keys = ["color", "volume", "weight", "pack", "type", "style"].filter((k) => variants.some((v) => v && v[k]));
  if (keys.length !== 1) return keys.length ? { key: "mixed", word: "options" } : null;
  const word: Record<string, string> = { color: "colour", volume: "capacity", weight: "weight", pack: "pack", type: "type", style: "style" };
  return { key: keys[0], word: word[keys[0]] };
}

/** The colour a product shows first (the first in stock), as the cards and
 *  the Deal of the Day pick it; null when its choice is not a colour. */
export function leadVariant(product: any): any | null {
  const list = (product?.product_variants || []).filter((v: any) => v && v.enable !== false);
  if (variantDimension(list)?.key !== "color") return null;
  const v = list.find((x: any) => x.quantity > 0) || list[0];
  return v && v.id ? v : null;
}

/** "Choose colour", "Choose capacity"…: the card's button for a product
    whose variants differ in one thing, in the visitor's language. */
export function chooseLabel(dim: { key: string } | null): string {
  switch (dim?.key) {
    case "color":
      return t("besti.choose.colour", "Choose colour");
    case "volume":
      return t("besti.choose.capacity", "Choose capacity");
    case "weight":
      return t("besti.choose.weight", "Choose weight");
    case "pack":
      return t("besti.choose.pack", "Choose pack");
    case "type":
      return t("besti.choose.type", "Choose type");
    case "style":
      return t("besti.choose.style", "Choose style");
    default:
      return t("besti.choose.options", "Choose options");
  }
}

/** A colour's English name (the list below) in the visitor's language. */
function colourWord(name: string): string {
  switch (name) {
    case "Black": return t("besti.colour.black", "Black");
    case "White": return t("besti.colour.white", "White");
    case "Gray": return t("besti.colour.gray", "Gray");
    case "Silver": return t("besti.colour.silver", "Silver");
    case "Red": return t("besti.colour.red", "Red");
    case "Pink": return t("besti.colour.pink", "Pink");
    case "Orange": return t("besti.colour.orange", "Orange");
    case "Yellow": return t("besti.colour.yellow", "Yellow");
    case "Green": return t("besti.colour.green", "Green");
    case "Teal": return t("besti.colour.teal", "Teal");
    case "Blue": return t("besti.colour.blue", "Blue");
    case "Navy": return t("besti.colour.navy", "Navy");
    case "Indigo": return t("besti.colour.indigo", "Indigo");
    case "Purple": return t("besti.colour.purple", "Purple");
    case "Brown": return t("besti.colour.brown", "Brown");
    case "Gold": return t("besti.colour.gold", "Gold");
    case "Beige": return t("besti.colour.beige", "Beige");
    case "Sky blue": return t("besti.colour.skyBlue", "Sky blue");
    case "Magenta": return t("besti.colour.magenta", "Magenta");
    case "Cyan": return t("besti.colour.cyan", "Cyan");
    default: return name;
  }
}

/** A colour's name for people ("Indigo"), from the nearest of a short list. */
const NAMES: [string, number, number, number][] = [
  ["Black", 0, 0, 0], ["White", 255, 255, 255], ["Gray", 128, 128, 128], ["Silver", 192, 192, 192],
  ["Red", 220, 30, 30], ["Pink", 255, 160, 190], ["Orange", 245, 130, 30], ["Yellow", 250, 215, 30],
  ["Green", 40, 160, 70], ["Teal", 0, 128, 128], ["Blue", 30, 90, 220], ["Navy", 0, 0, 128],
  ["Indigo", 48, 63, 159], ["Purple", 128, 40, 160], ["Brown", 120, 72, 40], ["Gold", 212, 175, 55],
  ["Beige", 225, 205, 170], ["Sky blue", 100, 180, 240], ["Magenta", 194, 24, 91], ["Cyan", 0, 220, 230],
];
export function colourName(color: string): string {
  const names = String(color || "")
    .split("/")
    .filter(Boolean)
    .map((c) => {
      const h = c.replace("#", "").slice(0, 6);
      const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      if ([r, g, b].some((x) => Number.isNaN(x))) return "";
      let best = NAMES[0], dist = Infinity;
      for (const n of NAMES) {
        const d = (n[1] - r) ** 2 + (n[2] - g) ** 2 + (n[3] - b) ** 2;
        if (d < dist) [best, dist] = [n, d];
      }
      return colourWord(best[0]);
    })
    .filter(Boolean);
  return [...new Set(names)].join(" / ");
}

/* ━━━━━━━━━━━━ Money as words ━━━━━━━━━━━━ */

/** An amount already in `currency` (the visitor's, from priceOf / moneyOf),
    formatted by the region switcher (Besti 1.0.19). */
export function moneyText(amount: number, currency: string, whole = false): string {
  return formatMoney(amount, currency || currentCurrency(), { short: whole });
}

/* ━━━━━━━━━━━━ Deal timers: the deal's own end ━━━━━━━━━━━━
   Every clock counts to the discount's own end date by Selldone's rule
   (PriceHelper.HasDiscountCountDownMode / GetEndOfDiscountDate: the chosen
   variant's dates when it has its own pricing, else the product's). A deal
   without an end date shows no clock. One shared ticker for the whole page
   (`tick.now`, once a second), never one interval per card. */
export const tick = reactive({ now: Date.now() });
let ticking = false;
export function startClock(): void {
  if (ticking || typeof window === "undefined") return;
  ticking = true;
  tick.now = Date.now();
  window.setInterval(() => (tick.now = Date.now()), 1000);
}

/** When this deal ends (a Date), or null: no end date, or not on now. */
export function dealEnd(product: any, variant: any = null): Date | null {
  if (!product) return null;
  try {
    if (!PriceHelper.HasDiscountCountDownMode(product, variant)) return null;
    const end = PriceHelper.GetEndOfDiscountDate(product, variant);
    return end && !isNaN(end.getTime()) ? end : null;
  } catch {
    return null;
  }
}

export interface TimeLeft {
  d: number;
  h: string;
  m: string;
  s: string;
  /** "364d 23:15:07", or "23:15:07" under a day. */
  text: string;
}

/** What is left until `end` at `now`; null once it has passed. */
export function timeLeft(end: Date | null, now: number): TimeLeft | null {
  if (!end) return null;
  const left = Math.floor((end.getTime() - now) / 1000);
  if (left <= 0) return null;
  const d = Math.floor(left / 86400);
  const h = String(Math.floor((left % 86400) / 3600)).padStart(2, "0");
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const sec = String(left % 60).padStart(2, "0");
  return { d, h, m, s: sec, text: (d ? t("besti.clock.days", "{n}d", { n: d }) + " " : "") + `${h}:${m}:${sec}` };
}

/** A brand's products: the catalogue with Selldone's own brand filter. */
export function brandRoute(brand: string) {
  return { name: window.$storefront.routes.SHOP_PAGE, query: { filter: JSON.stringify({ brands: [brand] }) } };
}
