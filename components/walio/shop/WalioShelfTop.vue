<!--
  Walio — the top of a listing (shop page design B and search design B,
  given to Walio on 7 November 2026).

  An aisle: a banner on the aisle's own tint with the crumbs, "Aisle", the
  title and description from the live record, three facts (products, on
  sale, sellers) and a few of the aisle's packshots. The catalogue (a
  search, the deals, every product): the title and count, the aisles the
  results sit in, and on a search its top match as one wide card.
-->
<template>
  <!-- Besti (digini-design/shop-b.html, search-b.html, deals-b.html): the
       crumbs, the title with the category's one-line description beside it
       (no product counts), and on a search its top match as a wide band. -->
  <div class="w-top b-top">
    <nav :aria-label="t('besti.ui.breadcrumb', 'Breadcrumb')" class="b-crumbs">
      <router-link :to="{ path: '/' }">{{ t("besti.ui.home", "Home") }}</router-link>
      <span aria-hidden="true" class="ms b-flip">chevron_right</span>
      <span aria-current="page">{{ crumb }}</span>
    </nav>

    <div :class="{ '-deals': deals_page }" class="b-top__title">
      <h1>{{ mode === "aisle" ? (aisle ? aisle.title || aisle.name : crumb) : title }}</h1>
      <p v-if="mode === 'aisle' && aisle && aisle.description">{{ aisle.description }}</p>
    </div>

    <besti-deal-of-day v-if="deals_page && dotd" :more="dotdMore" :product="dotd" class="b-top__dotd" @quick-buy="$emit('quick-buy', $event)" />

    <template v-if="mode !== 'aisle'">
      <div v-if="hits.length > 1" class="b-inaisles">
        <span>{{ t("besti.ui.inDepartments", "In departments") }}</span>
        <router-link v-for="h in hits" :key="h.aisle.id" :to="h.to" class="b-chip">{{ h.aisle.title || h.aisle.name }}</router-link>
      </div>
      <router-link v-if="search && top" :to="productTo(top)" class="b-match">
        <span class="b-match__im"><img :src="image(top, false)" :srcset="srcset(top)" alt="" sizes="(max-width: 760px) 96px, 200px" @error="dropSrcset" /></span>
        <span class="b-match__tx">
          <small>{{ t("besti.ui.topMatch", "Top match") }}</small>
          <b>{{ top.title }}</b>
          <span class="b-match__price">
            <u-price :amount="price(top).now" :currency="currency" />
            <span v-if="price(top).was" class="b-save">{{ t("besti.ui.save", "Save") }} <u-price :amount="price(top).was - price(top).now" :currency="currency" /></span>
          </span>
          <em>{{ t("besti.ui.seeTheProduct", "See the product") }}<span class="ms b-flip">chevron_right</span></em>
        </span>
      </router-link>
    </template>
  </div>
</template>

<script>
import { t } from "../../kalio/i18n/kalio-i18n";
import { currentCurrency } from "../../region-switcher/region";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import BestiDealOfDay from "../../besti/BestiDealOfDay.vue";
import { catalogue, dealOfTheDay, dealsOf, mixByCategory } from "../../besti/besti";
import { aisleImage, aisleIndex, dropSrcset, priceOf, productImage, productSrcset, tintFor } from "../../kalio/kalio-catalog";

export default {
  name: "WalioShelfTop",
  components: { BestiDealOfDay },
  mixins: [CurrencyMixin],
  emits: ["quick-buy"],
  inject: ["$shop"],

  props: {
    mode: { type: String, default: "aisle" },
    aisle: { type: Object, default: null },
    categoryName: { type: String, default: null },
    filter: { type: Object, default: null },
    total: { type: Number, default: null },
    onSale: { type: Number, default: null },
    sellers: { type: Array, default: () => [] },
    products: { type: Array, default: () => [] },
  },

  data() {
    return { window, index: null, all: [] };
  },

  computed: {
    currency() {
      return currentCurrency();
    },
    search() {
      return String(this.$route.query.search || "").trim();
    },
    deals() {
      return !!this.filter?.only_has_discount;
    },
    deals_page() {
      return this.deals && !this.search && this.mode !== "aisle";
    },
    dotd() {
      return dealOfTheDay(this.$shop, this.all);
    },
    dotdMore() {
      if (!this.dotd) return [];
      return mixByCategory(dealsOf(this.$shop, this.all).filter((p) => p.id !== this.dotd.id && p.category_id !== this.dotd.category_id), 3);
    },
    title() {
      if (this.search) return t("besti.shop.resultsFor", "Results for “{query}”", { query: this.search });
      if (this.deals) return t("besti.menu.todaysDeals", "Today’s deals");
      /* Besti: a brand's page (Shop by brand, Brands menu). */
      if (this.filter?.brands?.length === 1) return this.filter.brands[0];
      return t("besti.menu.allProducts", "All products");
    },
    crumb() {
      if (this.mode === "aisle") return this.aisle ? this.aisle.title || this.aisle.name : this.categoryName;
      return this.search ? t("besti.search", "Search") : this.title;
    },
    tint() {
      return tintFor(this.aisle) || "#e6f1fc";
    },
    packs() {
      return this.products.filter((p) => p.icon).slice(0, 4);
    },
    top() {
      return this.products[0] || null;
    },
    hits() {
      if (!this.index || !this.products.length) return [];
      const all = this.total !== null && this.products.length >= this.total;
      const by = new Map();
      for (const p of this.products) {
        const aisle = this.index.get(p.category_id);
        if (!aisle) continue;
        if (!by.has(aisle.id)) by.set(aisle.id, { aisle, count: 0, image: aisleImage(aisle, 64) || productImage(p, true) });
        by.get(aisle.id).count++;
      }
      return [...by.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
        .map((h) => ({
          ...h,
          count: all ? h.count : null,
          to: {
            name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
            params: { category_name: h.aisle.name },
            query: this.search ? { search: this.search } : this.deals ? { filter: JSON.stringify({ only_has_discount: true }) } : {},
          },
        }));
    },
  },

  mounted() {
    if (this.mode !== "aisle") aisleIndex().then((index) => (this.index = index));
    catalogue().then((list) => (this.all = list));
  },

  methods: {
    dropSrcset,
    srcset(p) {
      return productSrcset(p);
    },
    image(p, thumb = true) {
      return productImage(p, thumb);
    },
    price(p) {
      return priceOf(this.$shop, p, this.currency);
    },
    productTo(p) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p.id } };
    },
  },
};
</script>
