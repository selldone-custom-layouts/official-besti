<!--
  - Copyright (c) 2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  -->
<template>
  <!-- Besti 404 (digini-design/404-b.html): a bordered panel with a large
       404 (the 0 in blue), a search, quick ways out; then one row of
       departments and today's deals. -->
  <div class="b-404">
    <section class="b-404__panel b-wrap">
      <div class="b-404__in">
        <span aria-hidden="true" class="b-404__big">4<em>0</em>4</span>
        <div class="b-404__txt">
          <h1>{{ t("besti.404.title", "We can't find that page") }}</h1>
          <p>{{ t("besti.404.lede", "The link may be old, or the page has moved. Try a search or start from a department.") }}</p>
          <form class="b-search -big" role="search" @submit.prevent="go">
            <input v-model="q" :aria-label="t('besti.search', 'Search')" :placeholder="t('besti.search.placeholder', 'What can we help you find?')" enterkeyhint="search" type="search" />
            <button :aria-label="t('besti.search', 'Search')" class="b-search__go" type="submit"><span class="ms">search</span></button>
          </form>
          <div class="b-404__links">
            <span>{{ t("besti.404.orGoTo", "Or go to") }}</span>
            <router-link :to="deals" class="b-chip">{{ t("besti.menu.todaysDeals", "Today’s deals") }}</router-link>
            <router-link :to="newest" class="b-chip">{{ t("besti.header.new", "New arrivals") }}</router-link>
            <router-link :to="{ name: r.HISTORY_ORDERS_PHYSICAL }" class="b-chip">{{ t("besti.menu.trackOrder", "Track an order") }}</router-link>
            <router-link :to="{ name: r.SHOP_CONTACT_US }" class="b-chip">{{ t("besti.help", "Help") }}</router-link>
          </div>
        </div>
      </div>
    </section>

    <section v-if="cats.length" class="b-sec b-wrap">
      <header class="b-head">
        <h2>{{ t("besti.404.popular", "Popular departments") }}</h2>
        <router-link :to="catalogue" class="b-more">{{ t("besti.header.allDepartments", "All departments") }}<span class="ms b-flip">chevron_right</span></router-link>
      </header>
      <div :style="{ '--cols': Math.min(8, cats.length) }" class="b-depts -one">
        <router-link v-for="c in cats.slice(0, 8)" :key="c.id" :to="catTo(c)" class="b-dtile">
          <span><img v-if="c.icon" :src="icon(c)" alt="" loading="lazy" /><span v-else class="ms">category</span></span>
          <b>{{ c.title || c.name }}</b>
        </router-link>
      </div>
    </section>

    <besti-row :filter="{ only_has_discount: true }" :limit="12" :more-label="t('besti.deals.seeAll', 'See all deals')" :more-to="deals" :title="t('besti.menu.todaysDeals', 'Today’s deals')" class="b-wrap" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BestiRow from "../../../components/besti/BestiRow.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute } from "../../../components/kalio/kalio-catalog";

export default defineComponent({
  name: "StorefrontPageError404",
  components: { BestiRow },
  data: () => ({ q: "", cats: [] as any[] }),
  computed: {
    r(): any {
      return (window as any).$storefront.routes;
    },
    deals() {
      return dealsRoute();
    },
    newest() {
      return catalogueRoute({ sort: "newest" });
    },
    catalogue() {
      return catalogueRoute();
    },
  },
  mounted() {
    aisles().then((list) => (this.cats = list));
  },
  methods: {
    catTo(c: any) {
      return aisleRoute(c);
    },
    icon(c: any) {
      return (window as any).CDN.GET_CATEGORY_ICON(c.id, 256);
    },
    go() {
      const text = this.q.trim();
      this.$router.push(text ? { name: this.r.SHOP_PAGE, query: { search: text } } : catalogueRoute());
    },
  },
});
</script>
