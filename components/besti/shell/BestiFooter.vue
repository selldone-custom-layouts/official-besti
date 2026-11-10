<!--
  Besti — the footer (Home B).

  A blue newsletter band ("Deals in your inbox", Selldone's own subscribe),
  then navy columns: the white wordmark with the shop's description and its
  social links, Departments (live), Your orders, About (the merchant's own
  footer menu when there is one, else the standard pages) and Policies; the
  Theme row (Besti 1.0.16: the shared switcher's footer row, palettes, a
  custom colour and Light / Dark; only on Besti's showcase shop); and a legal
  row with a small "made with selldone" and Selldone's cookie settings. A
  shop with custom footer code keeps Selldone's footer.
-->
<template>
  <footer class="b-footer">
    <div class="b-footer__news">
      <div class="b-wrap b-footer__news-in">
        <div>
          <h3>Deals in your inbox</h3>
          <p>Price drops and new arrivals, about once a week.</p>
        </div>
        <form class="b-footer__form" @submit.prevent="subscribe">
          <input v-model.trim="email" :disabled="sent" aria-label="Email" autocomplete="email" placeholder="Enter your email" type="email" />
          <button :disabled="busy || sent" class="b-btn -navy" type="submit">
            <template v-if="sent"><span class="ms">check</span>Signed up</template>
            <template v-else>Sign up</template>
          </button>
          <p v-if="error" class="b-footer__err" role="alert">{{ error }}</p>
        </form>
      </div>
    </div>

    <div class="b-wrap b-footer__grid">
      <div class="b-footer__brand">
        <besti-logo light />
        <p>{{ lede }}</p>
        <s-storefront-social-buttons class="b-footer__social"></s-storefront-social-buttons>
      </div>
      <nav aria-label="Departments">
        <h4>Departments</h4>
        <router-link v-for="c in cats.slice(0, 6)" :key="c.id" :to="catTo(c)">{{ c.title || c.name }}</router-link>
        <router-link :to="allTo">All products</router-link>
      </nav>
      <nav aria-label="Your orders">
        <h4>Your orders</h4>
        <router-link :to="ordersTo">Track an order</router-link>
        <button class="b-footer__btn" type="button" @click="openCart">Your cart</button>
        <router-link v-if="user" :to="{ name: 'KalioAccountHome' }">Your account</router-link>
        <button v-else class="b-footer__btn" type="button" @click="signIn">Sign in</button>
        <router-link v-if="user" :to="{ name: r.USER_FAVORITES_PAGE }">Saved</router-link>
      </nav>
      <nav :aria-label="`About ${shopTitle}`">
        <h4>About {{ shopTitle }}</h4>
        <router-link v-for="(l, i) in aboutLinks" :key="i" :to="l.to">{{ l.name }}</router-link>
      </nav>
      <nav aria-label="Policies">
        <h4>Policies</h4>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">Terms of service</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">Privacy policy</router-link>
        <s-footer-section-gdpr class="b-footer__gdpr"></s-footer-section-gdpr>
      </nav>
    </div>

    <!-- The Theme row (the owner, 10 November 2026: in the footer, not the
         header). Showcase shops only: elsewhere the row renders nothing. -->
    <div v-if="themeOn" class="b-wrap b-footer__theme"><theme-switcher-row /></div>

    <div class="b-wrap b-footer__legal">
      <span>© {{ year }} {{ shopTitle }}</span>
      <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">Terms</router-link>
      <router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">Privacy</router-link>
      <div class="b-footer__pickers">
        <s-language-selector hide-details variant="plain"></s-language-selector>
        <u-currency-selector v-if="$shop.currencies && $shop.currencies.length > 1" :shop="$shop" hide-details @change="onChangeUserSelectedCurrency" />
      </div>
      <s-footer-section-selldone class="b-footer__made"></s-footer-section-selldone>
    </div>
  </footer>
</template>

<script>
import BestiLogo from "../BestiLogo.vue";
import SStorefrontSocialButtons from "@selldone/components-vue/storefront/social/SStorefrontSocialButtons.vue";
import SLanguageSelector from "@selldone/components-vue/storefront/language/selector/SLanguageSelector.vue";
import UCurrencySelector from "@selldone/components-vue/ui/currency/selector/UCurrencySelector.vue";
import SFooterSectionGdpr from "@selldone/components-vue/storefront/footer/section/gdpr/SFooterSectionGdpr.vue";
import SFooterSectionSelldone from "@selldone/components-vue/storefront/footer/section/selldone/SFooterSectionSelldone.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import ThemeSwitcherRow from "../../theme-switcher/ThemeSwitcherRow.vue";
import { themeState } from "../../theme-switcher/theme-switcher";
import { aisleRoute, aisles, catalogueRoute } from "../../kalio/kalio-catalog";

export default {
  name: "BestiFooter",
  components: { BestiLogo, SStorefrontSocialButtons, SLanguageSelector, UCurrencySelector, SFooterSectionGdpr, SFooterSectionSelldone, ThemeSwitcherRow },
  inject: ["$shop"],

  data: () => ({ cats: [], email: "", busy: false, sent: false, error: null, year: new Date().getFullYear(), theme: themeState }),

  computed: {
    /* The switcher shows only where the package allows it (showcase shops). */
    themeOn() {
      return this.theme.enabled;
    },
    r() {
      return window.$storefront.routes;
    },
    shopTitle() {
      return this.$shop?.title || "";
    },
    user() {
      return this.$store.getters.getUser;
    },
    allTo() {
      return catalogueRoute();
    },
    ordersTo() {
      return { name: this.r.HISTORY_ORDERS_PHYSICAL };
    },
    /* The shop's own description; Selldone's placeholder line is not shown. */
    lede() {
      const d = (this.$shop?.description || "").trim();
      if (d && !/^it['’]s my awesome .* website\.?$/i.test(d)) return d;
      return "Electronics for work, play and everything in between.";
    },
    /* The merchant's footer menu (Selldone menus, type FOOTER), without what
       the other columns already show (Home is the logo; Terms and Privacy are
       under Policies), then Guides, Contact us and FAQ when it lacks them. */
    aboutLinks() {
      const r = this.r;
      const menu = this.$shop?.menus?.find((it) => it.type === "FOOTER" && it.enable !== false);
      const skip = new Set([r.SHOP_PROFILE_PAGE_TERMS, r.SHOP_PROFILE_PAGE_PRIVACY]);
      const items = (menu?.menu || [])
        .flat()
        .filter((item) => item && item.name && item.to)
        .filter((item) => !item.to.name || this.$router.hasRoute(item.to.name))
        .filter((item) => !skip.has(item.to.name) && item.to.path !== "/")
        .map((item) => (item.to.name === r.SHOP_PAGE && !item.to.query ? { ...item, name: item.name === "Shop" ? "All products" : item.name, to: this.allTo } : item));
      const has = (name) => items.some((it) => it.to?.name === name);
      const out = items.length ? items : [{ name: "About us", to: { name: r.SHOP_PROFILE_PAGE_ABOUT_US } }];
      if (!has(r.BLOGS_PAGE) && !has(r.SHOP_BLOGS_PAGE) && !items.some((it) => it.to?.name === "Blogs")) out.push({ name: "Tips and guides", to: { name: r.BLOGS_PAGE } });
      if (!has(r.SHOP_CONTACT_US)) out.push({ name: "Contact us", to: { name: r.SHOP_CONTACT_US } });
      if (this.$router.hasRoute("ShopFAQ") && !has("ShopFAQ")) out.push({ name: "FAQ", to: { name: "ShopFAQ" } });
      return out;
    },
  },

  mounted() {
    aisles().then((list) => (this.cats = list));
  },

  methods: {
    catTo: aisleRoute,
    signIn() {
      EventBus.$emit("need-login", true);
    },
    openCart() {
      EventBus.$emit("besti:open-cart");
    },
    /* Selldone's newsletter audience (the same public call as the Page
       Builder's newsletter form: email marketing, "newsletter"). */
    subscribe() {
      this.error = null;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
        this.error = "Please enter a valid email address.";
        return;
      }
      this.busy = true;
      window.axios
        .post(window.XAPI.POST_STREAM_USER_ADD_NEWSLETTER(this.$shop.id, "newsletter"), { email: this.email })
        .then(({ data }) => {
          if (data?.error) this.error = data.error_msg || "That did not work. Please try again.";
          else this.sent = true;
        })
        .catch(() => (this.error = "That did not work. Please try again."))
        .finally(() => (this.busy = false));
    },
  },
};
</script>
