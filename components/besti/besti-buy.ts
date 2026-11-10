/*
 * Besti — what every buy button shares (the card, the Deal of the Day,
 * "Frequently bought together"): the product's variants, the colour picked
 * on it, its price, whether it can be added, and its count in the cart.
 *
 * A component using it has `product` (a prop or a computed). A colour
 * product adds the picked colour straight away and counts that colour's
 * line; a product whose choice is a capacity, size or pack opens the
 * quick-buy sheet ("quick-buy" event); a product without variants adds as
 * Kalio's cards always did (quickAdd). Every count goes through
 * kalio-basket's queue, so quick taps are never lost.
 */

import { currentCurrency } from "../region-switcher/region";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { percentOff } from "../kalio/kalio-catalog";
import { addVariant, basketLine, hasSizes, pendingLine, pendingLineFor, quickAdd, settling, shownCount, stepTo } from "../kalio/kalio-basket";
import { catalogueById, colourName, dealEnd, moneyOf, moneyText, saved, swatchBg, toggleSaved, variantDimension } from "./besti";

declare const window: any;

export default {
  mixins: [CurrencyMixin],
  emits: ["quick-buy"],

  data: () => ({ pick: 0, full_variants: null as any[] | null }),

  computed: {
    shop(this: any) {
      return this.$store.getters.getShop;
    },
    currency(this: any) {
      return currentCurrency();
    },
    productTo(this: any) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: this.product?.id } };
    },
    variants(this: any): any[] {
      const p = this.product;
      if (!p) return [];
      return p.product_variants || this.full_variants || p.variants || [];
    },
    dimension(this: any) {
      return variantDimension(this.variants.filter((v: any) => v.enable !== false));
    },
    colours(this: any): any[] {
      return this.dimension?.key === "color" ? this.variants.filter((v: any) => v.enable !== false) : [];
    },
    chips(this: any): string[] {
      const k = this.dimension?.key;
      if (!k || k === "color" || k === "mixed") return [];
      return [...new Set(this.variants.filter((v: any) => v.enable !== false).map((v: any) => v[k]).filter(Boolean))] as string[];
    },
    choose(this: any): boolean {
      return !!this.dimension && this.dimension.key !== "color";
    },
    variant(this: any) {
      if (!this.colours.length) return null;
      const v = this.colours[Math.min(this.pick, this.colours.length - 1)];
      return v && v.id ? v : null;
    },
    money(this: any) {
      return moneyOf(this.shop, this.product, this.variant, this.currency);
    },
    /** When this deal ends (the picked colour's dates when it has its own
        pricing), for BestiDealClock; null without an end date. */
    dealEndsAt(this: any): Date | null {
      return dealEnd(this.product, this.variant);
    },
    off(this: any): number {
      if (this.variant && this.money.was) return Math.round((this.money.save / this.money.was) * 100);
      return percentOff(this.shop, this.product);
    },
    pictureIcon(this: any) {
      return this.variant?.image || this.product?.icon || null;
    },
    soldOut(this: any): boolean {
      if (this.colours.length && this.variant) return !(this.variant.quantity > 0);
      return !(this.product?.quantity > 0);
    },
    line(this: any) {
      const p = this.product;
      if (!p) return null;
      if (this.colours.length) {
        if (!this.variant) return null;
        return basketLine(this, p, { id: this.variant.id }) || pendingLineFor(p, this.variant.id);
      }
      if (this.choose || hasSizes(p)) return null;
      return basketLine(this, p) || pendingLine(p);
    },
    shown(this: any): number {
      return shownCount(this.product, this.line);
    },
    busy(this: any): boolean {
      return settling(this.product, this.line);
    },
    comparing(this: any): boolean {
      return (this.$store.getters.getProductsComparison || []).some((p: any) => p.id === this.product?.id);
    },
    isSaved(this: any): boolean {
      return saved[this.product?.id] ?? !!this.product?.wishlist;
    },
  },

  watch: {
    "product.id": {
      handler(this: any) {
        this.pick = 0;
        this.full_variants = null;
        this.readVariants();
      },
      immediate: true,
    },
  },

  methods: {
    swatchBg,
    colourName,
    moneyWhole(this: any, n: number) {
      return moneyText(n, this.currency, Math.round(n) === n);
    },
    readVariants(this: any) {
      const p = this.product;
      if (!p) return;
      if (p.product_variants) return this.firstInStock(p.product_variants);
      if (!(p.variants && p.variants.length)) return;
      catalogueById().then((map) => {
        const rich = map.get(p.id);
        if (rich?.product_variants && this.product?.id === p.id) {
          this.full_variants = rich.product_variants;
          this.firstInStock(rich.product_variants);
        }
      });
    },
    firstInStock(this: any, list: any[]) {
      const colours = list.filter((v) => v.enable !== false);
      const at = colours.findIndex((v) => v.quantity > 0);
      this.pick = at > 0 ? at : 0;
    },
    add(this: any) {
      if (this.colours.length) {
        if (this.variant) addVariant(this, this.product, this.variant);
        else this.$emit("quick-buy", this.product);
        return;
      }
      quickAdd(this, this.product, () => this.$emit("quick-buy", this.product));
    },
    step(this: any, delta: number) {
      if (!this.line) return;
      stepTo(this, this.product, this.line, this.shown + delta);
    },
    toggleCompare(this: any) {
      if (this.comparing) this.removeFromProductComparison(this.product, null);
      else this.addToProductComparison(this.product, this.variant ? { ...this.variant } : null, true);
    },
    toggleSave(this: any) {
      toggleSaved(this, this.product);
    },
  },
};
