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
  Kalio — About us, design B "A letter", chosen by the owner on 5 November
  2026.

  Beside the letter: three of the shop's best sellers on a warm ground and
  the facts read from the shop itself — its sellers, its aisles, how many
  products it stocks — with the way to reach it. The letter is the shop's
  own About profile (Selldone dashboard › Shop › Profile) when it has one;
  until then a sample letter, marked as a test, with its values, a
  timeline (marked as examples) and a signature.
-->
<template>
  <!-- Walio 1.1.0 (About design B, "the magazine"): the story beside three
       photos, how an order works in four steps, what the shop stands for,
       and how to reach it. The text is the shop's own About profile
       (Selldone dashboard › Shop › Profile) when it has one; until then a
       sample, marked as such. The steps are read from the shop: its
       sellers and its delivery methods. -->
  <div class="w-mag k-wrap">
    <section class="w-mag__ed">
      <div>
        <p class="w-mag__eyebrow">{{ t("about.title", "About {shop}", { shop: shopTitle }) }}</p>
        <h1>{{ missing || busy ? sample.title : t("about.title", "About {shop}", { shop: shopTitle }) }}</h1>
        <div v-if="busy" aria-hidden="true" class="k-legal__loading"><span></span><span></span><span></span></div>
        <template v-else-if="missing">
          <kalio-sample-note>{{ t("besti.about.sampleNote", "This text is general copy written to show the page. It is not {shop}'s real story.", { shop: shopTitle }) }}</kalio-sample-note>
          <p class="w-mag__lead">{{ sample.lead }}</p>
          <p>{{ sample.text[0] }}</p>
          <p class="w-mag__sign">{{ sample.sign }}</p>
        </template>
        <div v-else class="k-prose" v-html="profile.body"></div>
      </div>
      <div aria-hidden="true" class="w-mag__photos">
        <span v-for="ph in photos" :key="ph" :style="{ backgroundImage: `url(${ph})` }"></span>
      </div>
    </section>

    <section class="t-sec">
      <header class="t-sec__head"><h2 class="t-sec__title">{{ t("besti.ui.howAnOrderWorks", "How an order works") }}</h2></header>
      <ol class="w-mag__how">
        <li v-for="(st, i) in how" :key="st.t">
          <i>{{ i + 1 }}</i>
          <b>{{ st.t }}</b>
          <p>{{ st.p }}</p>
        </li>
      </ol>
    </section>

    <section v-if="missing" class="t-sec">
      <div class="w-mag__vals">
        <div v-for="(value, i) in sample.values" :key="value.title">
          <v-icon size="26">{{ ICONS[i] || "check_circle" }}</v-icon>
          <b>{{ value.title }}</b>
          <p>{{ value.text }}</p>
        </div>
      </div>
    </section>

    <section id="contact" class="t-sec w-mag__contact">
      <div>
        <p class="w-mag__eyebrow">{{ t("besti.contactUs", "Contact us") }}</p>
        <h2>{{ t("besti.about.stillNeed", "Still need us?") }}</h2>
        <p>
          {{ t("besti.about.contactText", "For an order, the fastest way is the message thread on the order page: it comes straight to our team. For anything else, write to us.") }}
        </p>
      </div>
      <div class="w-mag__acts">
        <router-link :to="{ name: window.$storefront.routes.SHOP_CONTACT_US }" class="t-btn -main">{{ t("besti.ui.writeToUs", "Write to us") }}</router-link>
        <router-link :to="catalogueRoute" class="t-btn -line">{{ t("besti.ui.startShopping", "Start shopping") }}</router-link>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import KalioSampleNote from "@app-storefront/components/kalio/pages/KalioSampleNote.vue";
import { aboutSample, plainText } from "@app-storefront/components/kalio/pages/kalio-sample-pages";
import { aisles, catalogueRoute, countProducts, productImage, vendors } from "@app-storefront/components/kalio/kalio-catalog";
import { waysOf } from "@app-storefront/components/walio/walio-home";
import { photoOf, withPhoto } from "@app-storefront/components/besti/besti";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageOfficialAboutUs",
  components: { KalioSampleNote },
  inject: ["$shop"],

  data: () => ({
    profile: null,
    missing: false,
    busy: true,
    packs: [],
    sellers: [],
    aisleList: [],
    productCount: null,
    ICONS: ["sell", "compare_arrows", "inventory_2", "chat_bubble_outline"],
  }),

  computed: {
    shopTitle() {
      return this.$shop?.title || t("sample.thisShop", "This shop");
    },
    photos() {
      /* Besti: three of the owner's portrait photos, by department. */
      return withPhoto(this.aisleList, "portrait")
        .slice(0, 3)
        .map((c) => photoOf(c, "portrait").src);
    },
    /* The four steps, in the shop's own terms. */
    how() {
      const ways = waysOf(this.$shop).map((w) => w.word.toLowerCase());
      const many = this.sellers.length > 1;
      return [
        { t: "Pick and compare", p: "Every department, with full specs and Compare side by side." },
        { t: "One checkout", p: "One cart and one payment." },
        { t: "We pack it", p: "Your order is packed as soon as it is placed." },
        { t: "Delivered your way", p: ways.length ? `${ways.join(", ").replace(/, ([^,]*)$/, " or $1")}, as you choose at checkout.` : "As you choose at checkout." },
      ].map((st) => ({ ...st, p: st.p.charAt(0).toUpperCase() + st.p.slice(1) }));
    },
    sample() {
      return aboutSample(this.shopTitle);
    },
    catalogueRoute() {
      return catalogueRoute();
    },
    aisleLine() {
      const names = this.aisleList.map((it) => it.title || it.name);
      if (names.length <= 3) return names.join(", ");
      const shown = names.slice(0, 3).join(", ");
      return t("about.facts.aisleLine", { one: "{count}: {names} and {n} more", other: "{count}: {names} and {n} more" }, { count: names.length, names: shown, n: names.length - 3 });
    },
  },

  created() {
    this.setPageTitle?.(t("about.pageTitle", "About us"));

    window.axios
      .get(window.XAPI.GET_SHOP_PROFILE(this.$shop.name, "about-us"))
      .then(({ data }) => {
        this.profile = data?.error ? null : data?.profile || null;
        this.missing = !plainText(this.profile?.body);
      })
      .catch(() => (this.missing = true))
      .finally(() => (this.busy = false));

    window.$storefront.products
      .list(null, 0, 8, { products_only: true, available: true, sort: "bestselling" })
      .then(({ products }) => (this.packs = (products || []).filter((it) => it.icon).slice(0, 3)))
      .catch(() => {});
    vendors().then((list) => (this.sellers = list.filter((it) => it && it.name)));
    aisles().then((list) => (this.aisleList = list));
    countProducts(null).then((count) => (this.productCount = count));
  },

  methods: {
    picture(product) {
      return productImage(product);
    },
  },
};
</script>
