<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->
<!--
  🍉 This view will be shown in the StorefrontLayout.vue ▶ <router-view> component.

  Header
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃ Top Shop Menu                      ┃
  ┃  + <s-storefront-primary-header>   ┃
  ┃  + <s-storefront-top-menu>         ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  Primary Footer
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃ Show Vendor Info                   ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  Products Listing
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃ ⬜⬜⬜ ┃ 🟨   🟨   🟨   🟨   🟨  ┃
  ┃ ⬜⬜⬜ ┃ 🟨   ⬛   ⬛   ⬛   ⬛  ┃
  ┃ ⬜⬜⬜ ┃ ⬛   ⬛   ⬛   ⬛   ⬛  ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  -->
<template>
  <div>
    <v-card
      :flat="isMobile"
      class="s--shop-card s--shadow-no-padding -hide1720 pb-16"
    >
      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Top Shop Menu ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
      <div
        :class="{
          'add-marginal-side-menu-open':
            show_filter_menu && $vuetify.display.smAndUp,
        }"
        style="transition: all 400ms ease"
      >
        <slot name="header" :center="true"></slot>
      </div>

      <!--
        One page, four Kalio states. Selldone routes the shop page, every
        aisle and every seller to this same component, so the home page, the
        aisle sign and the seller storefront are chosen here by route. The
        home page stands on its own; the other three hand over to the live
        listing below, and so does the shop page once a query (search,
        filter, sort, "All products") asks for the catalogue itself.
      -->

      <!-- ▆▆▆▆▆▆▆▆ Shop page: the home (design B) ▆▆▆▆▆▆▆▆ -->
      <!-- Shown on the bare shop page only. Every narrowing action the
           listing performs travels as a query parameter, so the home page
           gets out of the way the moment a shopper searches or filters. -->
      <besti-home v-if="show_home" />

      <!-- ▆▆▆▆▆▆▆▆ Aisle, search, Deals, All products, seller (design B) ▆▆▆▆▆▆▆▆ -->
      <!-- A banner on top (the aisle with its numbers and packshots; a
           search's top match), then a column beside the grid: the filters
           (WalioFilterRail), or on a seller's page the seller's card. On a
           phone the column folds into a "Filters | Sort" bar over the grid. -->
      <div v-if="!show_home" class="w-shop k-wrap">
        <walio-shelf-top
          v-if="!vendor_id"
          :aisle="listing_parent"
          :category-name="category_name"
          :filter="t_filter"
          :mode="category_name ? 'aisle' : 'catalogue'"
          :on-sale="on_sale"
          :products="listing_products"
          :total="catalogue_total"
          @quick-buy="(p) => { quick_pick = p; quick_open = true; }"
        />
        <div class="w-shop__cols">
          <walio-seller-side v-if="vendor_id" :tab="seller_tab" :vendor-id="vendor_id" @tab="sellerTab" />
          <walio-filter-rail
            v-else
            :cats="aisle_list"
            :current="category_name"
            :filters="filters_def"
            :model-value="t_filter"
            :sort="t_sort"
            :sort-fallback="category_name ? t('besti.sort.featured', 'Featured') : t('besti.sort.bestMatch', 'Best match')"
            @update:model-value="setFilter"
            @update:sort="setSort"
          />
          <div class="w-shop__main">
            <walio-seller-main v-if="vendor_id" :key="'sm' + vendor_id" :vendor-id="vendor_id" />
            <!-- Besti: the filters that are on, as chips (no product count in
                 the shopper's words), and Sort by on the right. -->
            <div class="w-tools b-tools">
              <div class="b-chips">
                <button v-for="c in on_chips" :key="c.key" class="b-chip -on" type="button" @click="c.off()">
                  {{ c.label }}<v-icon size="16">close</v-icon>
                </button>
                <button v-if="on_chips.length > 1" class="b-link" type="button" @click="setFilter(null)">{{ t("besti.ui.clearAll", "Clear all") }}</button>
              </div>
              <walio-filter-rail
                v-if="vendor_id"
                :filters="filters_def"
                :model-value="t_filter"
                :sort="t_sort"
                compact
                @update:model-value="setFilter"
                @update:sort="setSort"
              />
              <walio-sort-menu v-else :model-value="t_sort" :fallback="category_name ? t('besti.sort.featured', 'Featured') : t('besti.sort.bestMatch', 'Best match')" @update:model-value="setSort" />
            </div>
            <s-products-listing
              ref="listing"
              :key="$route.path"
              :class="{ '-catalogue': catalogue }"
              :vendor-id="vendor_id"
              :has-breadcrumb="false"
              :has-filter="false"
              class="t-listing w-listing"
              load-more
              route-mode
              update-route
              @fetch-products="updateProductsSeo"
            ></s-products-listing>
          </div>
        </div>

        <!-- ▆▆▆▆▆▆▆▆ Under the grid ▆▆▆▆▆▆▆▆ -->
        <template v-if="!vendor_id">
          <besti-row v-if="catalogue && search_query" :limit="12" lazy sort="bestselling" :title="t('besti.ui.popularRightNow', 'Popular right now')" />
          <section v-if="more_aisles.length" class="t-keep">
            <h2 class="t-keep__h">{{ t("besti.ui.keepShopping", "Keep shopping") }}</h2>
            <div class="t-keep__list">
              <router-link v-for="a in more_aisles" :key="a.id" :to="aisleTo(a)">{{ a.title || a.name }}</router-link>
            </div>
          </section>
        </template>
      </div>
    </v-card>

    <!-- The catalogue's "+" opens Kalio's quick-buy sheet (kalio-listing-quick-buy.ts). -->
    <kalio-quick-buy v-model="quick_open" :product="quick_pick" />
  </div>
</template>

<script lang="ts">
import { t } from "../../components/kalio/i18n/kalio-i18n";
import SProductsListing from "@selldone/components-vue/storefront/products/listing/SProductsListing.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import BestiHome from "../../components/besti/BestiHome.vue";
import WalioShelfTop from "../../components/walio/shop/WalioShelfTop.vue";
import WalioFilterRail from "../../components/walio/shop/WalioFilterRail.vue";
import BestiRow from "../../components/besti/BestiRow.vue";
import { fromRoute } from "../../components/walio/shop/walio-filters";
import { colourName } from "../../components/besti/besti";
import { aisleRoute, aisles, countProducts, offers, vendors } from "../../components/kalio/kalio-catalog";
import WalioSellerSide from "../../components/walio/shop/WalioSellerSide.vue";
import WalioSellerMain from "../../components/walio/shop/WalioSellerMain.vue";
import WalioSortMenu from "../../components/walio/shop/WalioSortMenu.vue";
import {StorefrontSeo} from "../../helpers/StorefrontSeo";
import KalioQuickBuy from "../../components/kalio/KalioQuickBuy.vue";
import { hostQuickBuy } from "../../components/kalio/kalio-listing-quick-buy";
import { quickAdd } from "../../components/kalio/kalio-basket";
import "../../components/kalio/kalio-card-basket"; // a card in the basket shows − n +

export default {
  name: "StorefrontPageProducts",
  components: {
    SProductsListing,
    BestiHome,
    WalioShelfTop,
    WalioFilterRail,
    BestiRow,
    KalioQuickBuy,
    WalioSellerSide,
    WalioSellerMain,
    WalioSortMenu,
  },
  mixins: [TemplateMixin],

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Data
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  data: () => ({
    vendor_id: null /*Show only for this vendor! */,
    seoNavigation: StorefrontSeo.captureNavigation(),
    catalogue_total: null /* The listing's total, for the aisle and catalogue headers. */,
    quick_open: false /* Kalio's quick-buy sheet, for the listing's "+". */,
    quick_pick: null,
    listing_parent: null /* The aisle's record, as the listing read it. */,
    listing_products: [],
    t_filter: null /* The filter the listing has (the bar shows it). */,
    t_sort: null,
    on_sale: null,
    sold_by: null,
    sold_by_list: [],
    aisle_list: [],
  }),
  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Compute Section
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  computed: {
    shop_theme() {
      return this.getShop()?.theme;
    },
    show_filter_menu() {
      return this.$store.getters.getShowFilterMenu;
    },

    category_name() {
      return this.$route.params?.category_name || null;
    },

    search_query() {
      return String(this.$route.query?.search || "").trim();
    },

    /* Selldone's filter record: the aisle's own, or the shop's on the catalogue. */
    filters_def() {
      if (this.category_name) return this.listing_parent?.filters || null;
      return this.getShop()?.filters || null;
    },

    seller_tab() {
      if (this.t_filter?.only_has_discount) return "deals";
      if (this.t_sort === "newest") return "new";
      return "shop";
    },

    /* "in Dairy & Eggs", "for “milk”", "from Mason". */
    where_line() {
      if (this.vendor_id) return "from this seller";
      if (this.category_name) return `in ${this.listing_parent?.title || this.category_name}`;
      if (this.search_query) return `for “${this.search_query}”`;
      return "";
    },

    /* The narrowing choices that are on, each with its own way off. */
    on_chips() {
      const f = this.t_filter;
      if (!f) return [];
      const out = [];
      const next = () => JSON.parse(JSON.stringify(f));
      if (f.only_has_discount) out.push({ key: "sale", label: t("besti.filter.onSale", "On sale"), off: () => this.setFilter({ ...next(), only_has_discount: false }) });
      if (f.prices && Object.keys(f.prices).length) out.push({ key: "price", label: t("besti.filter.price", "Price"), off: () => this.setFilter({ ...next(), prices: null }) });
      for (const b of f.brands || []) out.push({ key: "b" + b, label: b, off: () => this.setFilter({ ...next(), brands: (f.brands || []).filter((x) => x !== b) }) });
      for (const [k, vals] of Object.entries(f.selected_spec || {}))
        for (const v of vals || [])
          out.push({
            key: "s" + k + v,
            label: String(v).split("|")[0],
            off: () => {
              const n = next();
              n.selected_spec[k] = (n.selected_spec[k] || []).filter((x) => x !== v);
              this.setFilter(n);
            },
          });
      for (const [k, vals] of Object.entries(f.selected_variants || {}))
        for (const v of vals || [])
          out.push({
            key: "v" + k + v,
            label: k === "colors" ? colourName(v) || "Colour" : String(v).split("|")[0],
            off: () => {
              const n = next();
              n.selected_variants[k] = (n.selected_variants[k] || []).filter((x) => x !== v);
              this.setFilter(n);
            },
          });
      return out;
    },
    more_aisles() {
      return this.aisle_list.filter((a) => a.name !== this.category_name).slice(0, 12);
    },

    /* The shop page asked for the catalogue itself (no aisle, no seller). */
    catalogue() {
      return (
        String(this.$route.name || "").startsWith(window.$storefront.routes.SHOP_PAGE) &&
        !this.vendor_id &&
        !this.show_home
      );
    },

    show_home() {
      return (
        String(this.$route.name || "").startsWith(window.$storefront.routes.SHOP_PAGE) &&
        !this.vendor_id &&
        !Object.keys(this.$route.query || {}).length
      );
    },
  },

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Watch Section
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  watch: {
    /* Layout default: on a grocery shelf "add to basket" belongs on the card.
       The listing shows Quick Buy only when the shop theme sets hover_actions.
       A merchant who has set it either way is respected; one who never
       touched it gets the grocery default. A watcher, not a one-shot write in
       created(): the storefront swaps in a fresh shop object when it refreshes
       the shop, and that swap silently discarded the earlier write. */
    shop_theme: {
      handler(theme) {
        if (!theme) return;
        if (theme.hover_actions === undefined) theme.hover_actions = true;
        /* Insta is a photo wall: the name and price only on hover, and no
           "+" below a laptop. As a starting view it hid a grocery card's
           name, so the shelf starts on the normal grid. A shopper who picks
           Insta from the toolbar still gets it, and keeps it: the listing
           reads their saved choice before the theme. */
        for (const device of ["mobile", "tablet", "pc"]) {
          if (theme[device] === "insta") theme[device] = "normal";
        }
      },
      immediate: true,
    },
    "$route.path"() {
      this.seoNavigation = StorefrontSeo.captureNavigation();
      /* A new aisle or seller starts without a count until its listing reads. */
      this.catalogue_total = null;
      this.listing_parent = null;
      this.listing_products = [];
      this.$nextTick(() => this.readRoute());
    },
    "$route.query.filter"() {
      this.t_filter = fromRoute(this.$route.query);
      this.readOnSale();
    },
    "$route.query.search"() {
      this.readOnSale();
    },
    /* The router reuses this one component for the catalogue root, every
       aisle and every seller, so created() runs only for the first of them:
       a shopper who clicked a seller on the market front kept vendor_id null
       and landed on the whole catalogue under a seller URL. The id is read
       again whenever the route record changes. Within one record it stays as
       upstream intends — sticky while the listing rewrites the query. */
    "$route.name"() {
      this.vendor_id = this.vendorIdFromRoute();
    },
    /* One seller to another is the same record with a new param. */
    "$route.params.vendor_id"() {
      this.vendor_id = this.vendorIdFromRoute();
    },
  },

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Component Lifecycle
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  created() {
    this.releaseQuickBuy = hostQuickBuy((product) =>
      quickAdd(this, product, (picked) => {
        this.quick_pick = picked;
        this.quick_open = true;
      }),
    );

    // ━━━━━━━ Initialize by query ━━━━━━━

    /*First load keep vendor ID to show products for this vendor.*/
    this.vendor_id = this.vendorIdFromRoute();

    this.setPageTitle(); // Set Page Title!
    this.readRoute();
    aisles().then((list) => (this.aisle_list = list));
  },
  beforeUnmount() {
    this.releaseQuickBuy?.();
  },

  methods: {
    vendorIdFromRoute() {
      return this.$route.params?.vendor_id
        ? this.$route.params?.vendor_id
        : this.$route.query?.vendor_id || null;
    },
    updateProductsSeo(data) {
      this.catalogue_total = typeof data?.total === "number" ? data.total : null;
      if (data?.parent !== undefined) this.listing_parent = data.parent && data.parent.id ? data.parent : null;
      this.listing_products = data?.products || [];
      StorefrontSeo.updateProducts(data, this.getShop(), this.seoNavigation);
    },

    /* ── Walio's filter bar talks to the listing directly ── */
    readRoute() {
      this.t_filter = fromRoute(this.$route.query);
      this.t_sort = this.$route.query?.sort || null;
      this.readOnSale();
      this.readSoldBy();
    },
    setFilter(filter) {
      this.t_filter = filter;
      this.$refs.listing?.setFilter(filter);
    },
    setSort(sort) {
      this.t_sort = sort;
      if (this.$refs.listing) this.$refs.listing.sort = sort;
    },
    pickType(key, value) {
      if (!key) return;
      const now = this.t_filter?.selected_spec?.[key] || [];
      const next = JSON.parse(JSON.stringify(this.t_filter || {}));
      next.selected_spec = { ...(next.selected_spec || {}), [key]: now.includes(value) ? now.filter((v) => v !== value) : [value] };
      this.setFilter(next);
    },
    sellerTab(tab) {
      const next = JSON.parse(JSON.stringify(this.t_filter || {}));
      next.only_has_discount = tab === "deals";
      this.setFilter(next);
      if (tab === "new") this.setSort("newest");
      else if (this.t_sort === "newest") this.setSort("bestselling");
      this.$nextTick(() => document.querySelector(".t-sall")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    },
    aisleTo(aisle) {
      return aisleRoute(aisle);
    },
    /* How many of this aisle (or search, or seller) are on offer. */
    readOnSale() {
      this.on_sale = null;
      if (this.show_home) return;
      const dir = this.category_name;
      const key = this.$route.fullPath;
      /* Counted with whatever else is picked, so "1 result · 1 on sale". */
      const options = { filter: JSON.stringify({ ...(this.t_filter || {}), only_has_discount: true }) };
      if (this.vendor_id) options.vendor_id = this.vendor_id;
      if (this.search_query) options.search = this.search_query;
      countProducts(dir, options).then((n) => {
        if (key === this.$route.fullPath) this.on_sale = n;
      });
    },
    /* "Sold by Mason and Alina": the sellers with a product in this aisle. */
    readSoldBy() {
      this.sold_by = null;
      this.sold_by_list = [];
      const dir = this.category_name;
      if (!dir || this.vendor_id) return;
      Promise.all([offers(), vendors(), aisles()]).then(([{ shelfOf }, list, all]) => {
        if (dir !== this.category_name) return;
        const aisle = all.find((a) => a.name === dir);
        if (!aisle) return;
        const names = list
          .filter((v) => (shelfOf.get(v.id) || []).some((p) => p.category_id === aisle.id))
          .map((v) => v.name);
        if (!names.length) return;
        this.sold_by = "Sold by " + (names.length > 2 ? `${names.length} sellers` : names.join(" and "));
        this.sold_by_list = names;
      });
    },
  },
};
</script>
