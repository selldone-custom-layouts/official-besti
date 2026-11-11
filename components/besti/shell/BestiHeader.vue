<!--
  Besti — the header (Home B "Department store").

  1. A navy strip with today's deal: its name, price and old price, "Ends
     in" counting to the deal's own end date (no end date, no clock), and
     "Shop the deal".
  2. A white bar: the ink wordmark, a search with a department scope and a
     blue search button (suggestions while typing), Track order, Saved, Sign
     in (or the account), and a blue cart pill with the count and the total.
     Before them, on a wide screen, the language and currency pill
     (components/region-switcher; Besti 1.0.19); on a phone the same choice is a
     row in the departments menu.
     (Besti 1.0.16: the Theme switcher is in the footer, BestiFooter.)
  3. A blue department bar: "All departments" opens a mega menu on a click
     and closes on a second click (no dark scrim behind it), then the live
     category names that fit and "More", and on the right Deals (yellow),
     New arrivals and Brands.

  Phone: a compact strip, the wordmark with the account and the cart pill,
  the search across the screen, and the department bar swiping sideways.
  There is no bottom tab bar. The cart opens Kalio's drawer (design C).
  A shop with custom header code keeps Selldone's header (StorefrontLayout).
-->
<template>
  <header v-if="!$store.getters.getIsNative" class="b-header">
    <!-- ▆▆▆▆ 1. Today's deal ▆▆▆▆
         The strip keeps its place while the catalogue loads, so the header
         never shifts down under anything already placed. -->
    <div v-if="dotd || !products_loaded" class="b-strip">
      <template v-if="dotd">
        <span class="b-strip__deal">
          <span class="ms fill">bolt</span><b>{{ t("besti.dotd.title", "Deal of the Day") }}</b>
          <em class="b-strip__t">{{ dotd.title }}, {{ money(dotdMoney.now) }}<s v-if="dotdMoney.was">{{ money(dotdMoney.was) }}</s></em>
          <b v-if="dotdOff" class="b-strip__pct">{{ t("besti.percentOff", "{n}% off", { n: dotdOff }) }}</b>
        </span>
        <besti-deal-clock :end="dotdEnd" mode="strip" />
        <router-link :to="productTo(dotd)" class="b-strip__go">{{ t("besti.dotd.shop", "Shop the deal") }}<span class="ms b-flip">chevron_right</span></router-link>
      </template>
    </div>

    <!-- ▆▆▆▆ 2. The main bar ▆▆▆▆ -->
    <div class="b-header__main">
      <besti-logo class="b-header__logo" />

      <form v-if="showSearch" class="b-search" role="search" @submit.prevent="submit()">
        <label class="b-search__scope">
          <span class="k-sr">{{ t("besti.search.in", "Search in") }}</span>
          <select v-model="scope" :aria-label="t('besti.search.in', 'Search in')">
            <option :value="null">{{ t("besti.search.all", "All") }}</option>
            <option v-for="c in cats" :key="c.id" :value="c.name">{{ c.title || c.name }}</option>
          </select>
          <span class="b-search__scope-t">{{ scopeTitle }}<span class="ms">expand_more</span></span>
        </label>
        <input
          ref="q"
          :value="q"
          aria-autocomplete="list"
          :aria-label="t('besti.search', 'Search')"
          autocomplete="off"
          enterkeyhint="search"
          :placeholder="t('besti.search.placeholder', 'What can we help you find?')"
          type="search"
          @blur="blurSoon"
          @focus="open_suggest = true"
          @input="onType($event.target.value)"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.esc="open_suggest = false"
        />
        <button :aria-label="t('besti.search', 'Search')" class="b-search__go" type="submit"><span class="ms">search</span></button>

        <div v-if="open_suggest && (hits.length || catHits.length)" class="b-suggest" role="listbox">
          <router-link
            v-for="c in catHits"
            :key="'c' + c.id"
            :to="catTo(c)"
            class="b-suggest__cat"
            role="option"
            @mousedown.prevent
            @click="open_suggest = false"
          >
            <span class="ms">category</span>{{ c.title || c.name }}<small>{{ t("besti.search.department", "Department") }}</small>
          </router-link>
          <router-link
            v-for="(p, i) in hits"
            :key="p.id"
            :class="{ '-on': i === cursor }"
            :to="productTo(p)"
            class="b-suggest__p"
            role="option"
            @mousedown.prevent
            @click="open_suggest = false"
          >
            <img :src="thumb(p)" alt="" />
            <span>{{ p.title }}</span>
            <u-price :amount="price(p).now" :currency="currency" />
          </router-link>
          <button class="b-suggest__all" type="button" @mousedown.prevent @click="submit()">
            {{ t("besti.search.seeAll", "See all results for “{query}”", { query: q }) }}<span class="ms b-flip">arrow_forward</span>
          </button>
        </div>
      </form>
      <span v-else class="b-header__sp"></span>

      <nav :aria-label="t('besti.header.yourAccount', 'Your account')" class="b-acts">
        <region-switcher-button v-if="!compact" :key="regionKey" button-class="b-region" />
        <router-link :to="ordersTo" class="b-act -track"><span class="ms">local_shipping</span><span class="b-act__t">{{ t("besti.header.track", "Track order") }}</span></router-link>
        <component :is="user ? 'router-link' : 'button'" :to="user ? savedTo : undefined" :type="user ? undefined : 'button'" class="b-act -saved" @click="!user && signIn()">
          <span class="ms">favorite</span><span class="b-act__t">{{ t("besti.header.saved", "Saved") }}</span>
        </component>
        <router-link v-if="user" :to="accountTo" class="b-act -me">
          <span class="ms">person</span><span class="b-act__t">{{ firstName }}</span>
        </router-link>
        <button v-else-if="!busyUser" class="b-act -me" type="button" @click="signIn"><span class="ms">person</span><span class="b-act__t">{{ t("besti.header.signIn", "Sign in") }}</span></button>
        <span v-else class="b-act -me -wait"><span class="ms">person</span><span class="b-act__t">{{ t("besti.header.account", "Account") }}</span></span>

        <button :aria-label="t('besti.header.cartAria', { one: 'Cart, {n} item', other: 'Cart, {n} items' }, { n: units })" class="b-cartpill" type="button" @click="cart = true">
          <span class="ms fill">shopping_cart</span>
          <i v-if="units">{{ units }}</i>
          <span class="b-cartpill__t"><template v-if="units">{{ cartMoney }}</template><template v-else>{{ t("besti.header.cart", "Cart") }}</template></span>
        </button>
      </nav>
    </div>

    <!-- ▆▆▆▆ 3. Departments ▆▆▆▆ -->
    <nav :aria-label="t('besti.departments', 'Departments')" class="b-dept">
      <div ref="deptRow" class="b-dept__in">
        <button :aria-expanded="mega ? 'true' : 'false'" class="b-dept__all" type="button" @click="toggleMega">
          <span class="ms">{{ mega ? "close" : "menu" }}</span>{{ t("besti.header.allDepartments", "All departments") }}
        </button>
        <router-link v-for="c in barCats" :key="c.id" :class="{ '-on': $route.params.category_name === c.name }" :to="catTo(c)" class="b-dept__a">
          {{ c.title || c.name }}
        </router-link>
        <v-menu v-if="moreCats.length && !compact" location="bottom start" offset="0">
          <template v-slot:activator="{ props, isActive }">
            <button class="b-dept__a -more" type="button" v-bind="props">{{ t("besti.header.more", "More") }}<span :class="{ '-up': isActive }" class="ms">expand_more</span></button>
          </template>
          <div class="b-menu">
            <router-link v-for="c in moreCats" :key="c.id" :to="catTo(c)">{{ c.title || c.name }}</router-link>
          </div>
        </v-menu>
        <span class="b-dept__sp"></span>
        <router-link :to="dealsTo" class="b-dept__a -deals"><span class="ms fill">sell</span>{{ t("besti.header.deals", "Deals") }}</router-link>
        <router-link :to="newTo" class="b-dept__a">{{ t("besti.header.new", "New arrivals") }}</router-link>
        <v-menu v-if="brands.length && !compact" location="bottom end" offset="0">
          <template v-slot:activator="{ props, isActive }">
            <button class="b-dept__a" type="button" v-bind="props">{{ t("besti.header.brands", "Brands") }}<span :class="{ '-up': isActive }" class="ms">expand_more</span></button>
          </template>
          <div class="b-menu -brands">
            <router-link v-for="b in brands" :key="b" :to="brandTo(b)">{{ b }}</router-link>
          </div>
        </v-menu>
      </div>

      <!-- The mega menu: opened and closed by "All departments" only (and Esc,
           a click elsewhere, or going to a page). No scrim. -->
      <div v-if="mega" ref="mega" class="b-mega" @keydown.esc="mega = false">
        <div class="b-mega__in">
          <!-- On a phone or tablet (under 900px) more than 8 departments show
               the first 6 and "Show N more" (the owner's option A, 10 November
               2026); the rest open in place and the button reads "Show fewer". -->
          <div class="b-mega__grid">
            <router-link v-for="c in megaFirst" :key="c.id" :to="catTo(c)" class="b-mega__item">
              <span class="b-mega__ic"><img v-if="c.icon" :src="catIcon(c)" alt="" /></span>
              <span><b>{{ c.title || c.name }}</b><small v-if="c.description">{{ c.description }}</small></span>
            </router-link>
            <div v-if="megaRest.length" id="b-mega-more" :class="{ '-open': megaMore }" class="b-mega__extra">
              <div>
                <router-link
                  v-for="(c, i) in megaRest"
                  :key="c.id"
                  :style="{ transitionDelay: megaMore ? `${i * 20}ms` : '0ms' }"
                  :to="catTo(c)"
                  class="b-mega__item"
                >
                  <span class="b-mega__ic"><img v-if="c.icon" :src="catIcon(c)" alt="" /></span>
                  <span><b>{{ c.title || c.name }}</b><small v-if="c.description">{{ c.description }}</small></span>
                </router-link>
              </div>
            </div>
            <button
              v-if="megaRest.length"
              :aria-expanded="megaMore ? 'true' : 'false'"
              aria-controls="b-mega-more"
              class="b-mega__more"
              type="button"
              @click="megaMore = !megaMore"
            >
              <span aria-hidden="true" class="b-mega__ic -more"><span class="ms">expand_more</span></span>
              <span>{{ megaMore ? t("besti.menu.showFewer", "Show fewer") : t("besti.menu.showMore", "Show {n} more", { n: megaRest.length }) }}</span>
            </button>
          </div>
          <div class="b-mega__side">
            <router-link :to="dealsTo"><span class="ms fill">sell</span>{{ t("besti.menu.todaysDeals", "Today’s deals") }}</router-link>
            <router-link :to="newTo"><span class="ms">new_releases</span>{{ t("besti.header.new", "New arrivals") }}</router-link>
            <router-link :to="allTo"><span class="ms">grid_view</span>{{ t("besti.menu.allProducts", "All products") }}</router-link>
            <router-link :to="ordersTo"><span class="ms">local_shipping</span>{{ t("besti.menu.trackOrder", "Track an order") }}</router-link>
            <!-- Phone and tablet: language and currency (the desktop has the header pill). -->
            <region-sheet v-if="compact" :key="regionKey" keep-menu row-class="b-mega__region" />
          </div>
        </div>
      </div>
    </nav>

    <!-- ▆▆▆▆ The cart drawer (design C) ▆▆▆▆ -->
    <teleport to="body">
      <v-navigation-drawer
        v-model="cart"
        :location="$vuetify.locale.isRtl ? 'left' : 'right'"
        :width="windowWidth < 520 ? windowWidth : 440"
        class="k-drawer -basket b-drawer"
        temporary
      >
        <div class="k-drawer__head">
          <p class="k-drawer__title">{{ t("besti.cart.title", "Your cart") }}<small v-if="units">{{ t("besti.cart.items", { one: "{n} item", other: "{n} items" }, { n: units }) }}</small></p>
          <button :aria-label="t('besti.close', 'Close')" class="b-x" type="button" @click="cart = false"><span class="ms">close</span></button>
        </div>
        <div v-if="!units" class="b-empty -drawer">
          <span aria-hidden="true" class="b-empty__ic"><span class="ms">shopping_cart</span></span>
          <p class="b-empty__t">{{ t("besti.cart.empty.title", "Your cart is empty") }}</p>
          <p class="b-empty__p">{{ t("besti.cart.empty.text", "Find something you love and it will wait for you here.") }}</p>
          <router-link :to="dealsTo" class="b-btn" @click="cart = false">{{ t("besti.cart.empty.deals", "Shop today’s deals") }}</router-link>
          <router-link :to="allTo" class="b-btn -line" @click="cart = false">{{ t("besti.cart.empty.continue", "Continue shopping") }}</router-link>
        </div>
        <kalio-basket-drawer v-else @close="cart = false" />
      </v-navigation-drawer>
    </teleport>
  </header>
</template>

<script>
import { convert, currentCurrency, formatMoney } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import BestiLogo from "../BestiLogo.vue";
import BestiDealClock from "../BestiDealClock.vue";
import KalioBasketDrawer from "../../kalio/shell/KalioBasketDrawer.vue";
import RegionSwitcherButton from "../../region-switcher/RegionSwitcherButton.vue";
import RegionSheet from "../../region-switcher/RegionSheet.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { basketView } from "../../kalio/kalio-basket";
import { brandRoute, brandsOf, catalogue, dealEnd, dealOfTheDay, leadVariant, ltr, moneyOf, moneyText, percentOff } from "../besti";

export default {
  name: "BestiHeader",
  components: { BestiLogo, BestiDealClock, KalioBasketDrawer, RegionSwitcherButton, RegionSheet },
  mixins: [CurrencyMixin],
  inject: ["$shop"],

  props: {
    showSearch: { type: Boolean, default: true },
  },

  emits: ["search", "clear"],

  data: () => ({
    cats: [],
    products: [],
    products_loaded: false,
    q: "",
    scope: null,
    hits: [],
    cursor: -1,
    open_suggest: false,
    mega: false,
    megaMore: false,
    cart: false,
    windowWidth: typeof window !== "undefined" ? window.innerWidth : 1440,
  }),

  computed: {
    /* The region package reads its words when it draws, and a language file
       arrives a moment after the pick (one lazy chunk): the pill and the
       menu's row are drawn again when it does (Besti 1.0.26, as Senso). */
    regionKey() {
      return t("region.title", "Language & currency");
    },
    user() {
      return this.$store.getters.getUser;
    },
    busyUser() {
      return this.$store.getters.getBusyUser;
    },
    firstName() {
      return String(this.user?.name || t("besti.header.account", "Account")).split(/\s+/)[0].slice(0, 14);
    },
    compact() {
      return this.windowWidth < 900;
    },
    currency() {
      return currentCurrency();
    },
    units() {
      return this.getBaskets().reduce((sum, b) => sum + (b?.items || []).reduce((n, it) => n + (it.count || 0), 0), 0);
    },
    /* The cart's total: the bill's when there is one, else the basket's. */
    cartTotal() {
      let sum = 0;
      for (const b of this.getBaskets()) {
        if (!b?.items?.length) continue;
        let n = 0;
        if (typeof b.bill?.price === "number") n = b.bill.price;
        else if (typeof b.price === "number") n = b.price;
        else for (const it of b.items) n += Number(it.price || 0) * (it.count || 0);
        /* Each basket in its own currency, shown in the visitor's: the server
           reprices the cart after a pick; this covers the moment before. */
        const from = b.bill?.currency || b.currency || this.currency;
        const c = convert(n, from, this.currency);
        sum += c === null ? n : c;
      }
      return Math.max(0, sum);
    },
    cartMoney() {
      return ltr(formatMoney(this.cartTotal, this.currency));
    },
    ordersTo() {
      return { name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL };
    },
    savedTo() {
      return { name: window.$storefront.routes.USER_FAVORITES_PAGE };
    },
    accountTo() {
      return { name: "KalioAccountHome" };
    },
    dealsTo() {
      return dealsRoute();
    },
    newTo() {
      return catalogueRoute({ sort: "newest" });
    },
    allTo() {
      return catalogueRoute();
    },
    dotd() {
      return dealOfTheDay(this.$shop, this.products);
    },
    /* The colour the Deal of the Day shows first: its price, saving and end
       are that colour's when it has its own pricing. */
    dotdVariant() {
      return leadVariant(this.dotd);
    },
    dotdMoney() {
      return moneyOf(this.$shop, this.dotd, this.dotdVariant, this.currency);
    },
    dotdOff() {
      if (!this.dotd) return 0;
      const m = this.dotdMoney;
      if (this.dotdVariant && m.was) return Math.round((m.save / m.was) * 100);
      return percentOff(this.$shop, this.dotd);
    },
    dotdEnd() {
      return dealEnd(this.dotd, this.dotdVariant);
    },
    brands() {
      return brandsOf(this.products);
    },
    /* As many department names as fit the bar; the rest go under "More". */
    barCount() {
      const w = this.windowWidth;
      if (w < 900) return this.cats.length;
      if (w >= 1560) return 9;
      if (w >= 1400) return 8;
      if (w >= 1240) return 6;
      if (w >= 1080) return 4;
      return 3;
    },
    barCats() {
      return this.cats.slice(0, this.barCount);
    },
    moreCats() {
      return this.cats.slice(this.barCount);
    },
    /* The departments menu on a phone or tablet: more than 8 show the first
       6 (the merchant's order) and "Show N more"; 8 or fewer show them all.
       A wide screen always shows them all. */
    megaFirst() {
      return this.compact && this.cats.length > 8 ? this.cats.slice(0, 6) : this.cats;
    },
    megaRest() {
      return this.compact && this.cats.length > 8 ? this.cats.slice(6) : [];
    },
    scopeTitle() {
      const c = this.cats.find((x) => x.name === this.scope);
      return c ? c.title || c.name : t("besti.search.all", "All");
    },
    catHits() {
      const q = this.q.trim().toLowerCase();
      if (q.length < 2) return [];
      return this.cats.filter((c) => `${c.title} ${c.name}`.toLowerCase().includes(q)).slice(0, 2);
    },
  },

  watch: {
    $route() {
      this.mega = false;
      this.cart = false;
      this.open_suggest = false;
    },
    cart(open) {
      basketView.drawerOpen = open;
      this.$store.commit("setForceHideNavigation", open);
    },
    mega(open) {
      this.megaMore = false; /* each time the menu opens it starts collapsed */
      if (open) document.addEventListener("click", this.outside, true);
      else document.removeEventListener("click", this.outside, true);
    },
    "$route.query.search": {
      handler(v) {
        this.q = v ? String(v) : "";
      },
      immediate: true,
    },
  },

  mounted() {
    aisles().then((list) => (this.cats = list));
    catalogue()
      .then((list) => (this.products = list))
      .finally(() => (this.products_loaded = true));
    this.onResize = () => (this.windowWidth = window.innerWidth);
    window.addEventListener("resize", this.onResize, { passive: true });
    /* Any part of the page can open the cart (the footer's Cart link). */
    this.openCart = () => (this.cart = true);
    EventBus.$on("besti:open-cart", this.openCart);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("click", this.outside, true);
    EventBus.$off("besti:open-cart", this.openCart);
    clearTimeout(this.typing);
  },

  methods: {
    t,
    money(n) {
      return moneyText(n, this.currency);
    },
    price(p) {
      return moneyOf(this.$shop, p, null, this.currency);
    },
    catTo: aisleRoute,
    catIcon(c) {
      return window.CDN.GET_CATEGORY_ICON(c.id, 128);
    },
    productTo(p) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p.id } };
    },
    brandTo: brandRoute,
    searchTo(text) {
      return { name: window.$storefront.routes.SHOP_PAGE, query: { search: text } };
    },
    thumb(p) {
      return window.CDN.GET_SHOP_IMAGE_PATH(p.icon, 64);
    },
    signIn() {
      EventBus.$emit("need-login", true);
    },
    toggleMega() {
      this.mega = !this.mega;
    },
    outside(e) {
      /* The language and currency sheet is teleported to <body>: a tap in it is not "outside". */
      const inside = this.$refs.mega?.contains(e.target) || this.$refs.deptRow?.querySelector(".b-dept__all")?.contains(e.target) || e.target.closest?.(".rs-sheet-wrap");
      if (!inside) this.mega = false;
    },
    /* Suggestions while typing: the input's own value (v-model waits for an
       Android keyboard's composition to end). */
    onType(value) {
      this.q = value;
      this.cursor = -1;
      this.open_suggest = true;
      clearTimeout(this.typing);
      const q = value.trim();
      if (q.length < 2) {
        this.hits = [];
        return;
      }
      this.typing = setTimeout(() => {
        window.axios
          .get(window.XAPI.GET_SEARCH_QUERY(window.$storefront.name, encodeURIComponent(q)))
          .then(({ data }) => {
            if (this.q.trim() !== q) return;
            const items = (data?.items || []).filter((p) => p && p.id && p.title && p.icon);
            const scoped = this.scope ? items.filter((p) => this.cats.find((c) => c.name === this.scope)?.id === p.category_id) : items;
            this.hits = scoped.slice(0, 6);
          })
          .catch(() => (this.hits = []));
      }, 250);
    },
    move(d) {
      if (!this.hits.length) return;
      this.cursor = (this.cursor + d + this.hits.length) % this.hits.length;
    },
    blurSoon() {
      setTimeout(() => (this.open_suggest = false), 150);
    },
    submit() {
      if (this.cursor >= 0 && this.hits[this.cursor]) {
        this.$router.push(this.productTo(this.hits[this.cursor]));
        this.open_suggest = false;
        return;
      }
      const text = this.q.trim();
      this.open_suggest = false;
      this.$refs.q?.blur();
      if (this.scope) {
        this.$router.push({ ...aisleRoute({ name: this.scope }), query: text ? { search: text } : {} });
        return;
      }
      if (!text) {
        this.$emit("clear");
        return;
      }
      this.$emit("search", { search: text, search_type: null });
    },
  },
};
</script>
