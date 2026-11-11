<!--
  Besti — the home page (Home B "Department store", approved by the owner,
  digini-design/home-b.html).

  In order: a photo hero (one slide per category with a wide photo, a white
  card with the category's live "Up to $X off" / "From $Y") with two photo
  tiles beside it; Shop by department (two even rows, never a hole); the
  Deal of the Day; Top deals with category tabs (two rows of five); the
  "Everyday essentials" photo mosaic; Best sellers (from the shop's
  best-seller tag, hidden without it); a wide photo banner; New arrivals; one
  row of brands; a "<Tag> Items" row for every other tag in use; Recently
  viewed (this browser's history); and the four newest articles, last.

  Everything is read from the shop. The photos are matched to categories by
  their name slug; a category without one gets a collage of its products.
-->
<template>
  <div class="b-home">
    <!-- ▆▆▆▆ Hero ▆▆▆▆ -->
    <section v-if="slides.length || !ready" ref="hero" class="b-hero b-wrap" @mouseenter="pause = true" @mouseleave="pause = false">
      <div v-if="!slides.length" class="b-hero__main -skeleton"></div>
      <div v-else :aria-label="t('besti.home.hero.deals', '{name} deals', { name: slide.title || slide.name })" aria-roledescription="slide" class="b-hero__main" role="group">
        <!-- The photo and its words change together (a slide caught between
             its old photo and its new words read wrong on a phone). -->
        <transition mode="out-in" name="b-fade">
          <div :key="slide.id" class="b-hero__slide">
            <besti-photo
              :alt="slide.title || slide.name"
              :photo="photoOf(slide, 'wide')"
              :products="inCategory(slide).slice(0, 4)"
              class="b-hero__photo"
              eager
              sizes="(max-width: 900px) 100vw, 1100px"
            />
            <div class="b-hero__card">
              <small>{{ line(slide) }}</small>
              <h1>{{ t("besti.home.hero.deals", "{name} deals", { name: slide.title || slide.name }) }}</h1>
              <p v-if="slide.description">{{ slide.description }}</p>
              <div class="b-hero__row">
                <router-link :to="catTo(slide)" class="b-btn">{{ t("besti.ui.shopNow", "Shop now") }}</router-link>
                <template v-if="slides.length > 1">
                  <span class="b-hero__count">{{ at + 1 }} / {{ slides.length }}</span>
                  <button :aria-label="t('besti.ui.previousSlide', 'Previous slide')" class="b-round" type="button" @click="go(-1)"><span class="ms b-flip">chevron_left</span></button>
                  <button :aria-label="t('besti.ui.nextSlide', 'Next slide')" class="b-round" type="button" @click="go(1)"><span class="ms b-flip">chevron_right</span></button>
                </template>
              </div>
            </div>
          </div>
        </transition>
      </div>
      <router-link v-for="c in sideTiles" :key="c.id" :to="catTo(c)" class="b-hero__side">
        <besti-photo :photo="sidePhoto(c)" :products="inCategory(c).slice(0, 3)" eager sizes="(max-width: 900px) 50vw, 320px" />
        <span>
          <b>{{ c.title || c.name }}</b>
          <small>{{ line(c) }}</small>
          <em>{{ t("besti.ui.shop", "Shop") }}<span class="ms b-flip">arrow_forward</span></em>
        </span>
      </router-link>
    </section>

    <!-- ▆▆▆▆ Shop by department: two even rows ▆▆▆▆ -->
    <section v-if="tiles.cats.length" class="b-sec b-wrap">
      <header class="b-head"><h2>{{ t("besti.ui.shopByDepartment", "Shop by department") }}</h2></header>
      <div :style="{ '--cols': tiles.cols }" class="b-depts">
        <router-link v-for="c in tiles.cats" :key="c.id" :to="catTo(c)" class="b-dtile">
          <span><img v-if="c.icon" :src="catIcon(c)" alt="" loading="lazy" /><span v-else class="ms">category</span></span>
          <b>{{ c.title || c.name }}</b>
        </router-link>
        <router-link v-if="tiles.all" :to="allTo" class="b-dtile -all">
          <span><span class="ms">grid_view</span></span>
          <b>{{ t("besti.ui.allDepartments", "All departments") }}</b>
        </router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ Deal of the Day ▆▆▆▆ -->
    <besti-deal-of-day v-if="dotd" :more="moreDeals" :product="dotd" class="b-wrap" @quick-buy="quickBuy" />

    <!-- ▆▆▆▆ Top deals, by category ▆▆▆▆ -->
    <section v-if="topDeals.length" class="b-sec b-wrap">
      <header class="b-head">
        <h2>{{ t("besti.ui.topDeals", "Top deals") }}</h2>
        <div class="b-tabs" role="tablist">
          <button :aria-selected="!tab" :class="{ '-on': !tab }" role="tab" type="button" @click="tab = null">{{ t("besti.ui.all", "All") }}</button>
          <button
            v-for="c in dealTabs"
            :key="c.id"
            :aria-selected="tab === c.id"
            :class="{ '-on': tab === c.id }"
            role="tab"
            type="button"
            @click="tab = c.id"
          >
            {{ c.title || c.name }}
          </button>
        </div>
        <router-link :to="dealsTo" class="b-more">{{ t("besti.ui.seeAllDeals", "See all deals") }}<span class="ms b-flip">chevron_right</span></router-link>
      </header>
      <div :class="'-n' + topDeals.length" class="b-grid">
        <besti-card v-for="p in topDeals" :key="p.id" :product="p" @quick-buy="quickBuy" />
      </div>
    </section>

    <!-- ▆▆▆▆ Everyday essentials: one big photo and four ▆▆▆▆ -->
    <section v-if="mosaic.length === 5" class="b-sec b-wrap">
      <header class="b-head"><h2>{{ t("besti.ui.everydayEssentials", "Everyday essentials") }}</h2></header>
      <div class="b-mosaic">
        <router-link v-for="(c, i) in mosaic" :key="c.id" :class="'-m' + i" :to="catTo(c)" class="b-mo">
          <besti-photo :photo="photoOf(c, 'square')" :products="inCategory(c).slice(0, 4)" :sizes="i ? '(max-width: 900px) 50vw, 330px' : '(max-width: 900px) 100vw, 680px'" />
          <span><b>{{ c.title || c.name }}</b><small>{{ line(c) }}</small></span>
        </router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ Best sellers (the shop's best-seller tag) ▆▆▆▆ -->
    <section v-if="bento.big" class="b-sec b-wrap">
      <header class="b-head">
        <h2>{{ t("besti.ui.bestSellers", "Best sellers") }}</h2>
        <router-link v-if="bento.tag" :to="tagTo(bento.tag)" class="b-more">{{ t("besti.ui.seeAll", "See all") }}<span class="ms b-flip">chevron_right</span></router-link>
      </header>
      <div :style="{ '--cols': bento.cols }" class="b-bento">
        <besti-card :product="bento.big" big class="b-bento__big" :rank="t('besti.ui.bestSeller', 'Best seller')" @quick-buy="quickBuy" />
        <besti-card v-for="p in bento.rest" :key="p.id" :product="p" @quick-buy="quickBuy" />
      </div>
    </section>

    <!-- ▆▆▆▆ A wide photo banner ▆▆▆▆ -->
    <section v-if="banner" class="b-wide b-wrap">
      <div class="b-wide__in">
        <besti-photo :photo="photoOf(banner.cat, 'wide')" :products="inCategory(banner.cat).slice(0, 4)" sizes="(max-width: 900px) 100vw, 1400px" />
        <div class="b-wide__txt">
          <small>{{ banner.eyebrow }}</small>
          <h2>{{ banner.title }}</h2>
          <p v-if="banner.cat.description">{{ banner.cat.description }}</p>
          <div class="b-wide__links">
            <router-link v-for="c in banner.links" :key="c.id" :to="catTo(c)"><b>{{ c.title || c.name }}</b><small>{{ line(c) }}</small></router-link>
          </div>
          <router-link :to="catTo(banner.cat)" class="b-btn">{{ banner.cta }}</router-link>
        </div>
      </div>
    </section>

    <!-- ▆▆▆▆ New arrivals ▆▆▆▆ -->
    <besti-rail :more-to="newTo" :products="newest" class="b-wrap" :title="t('besti.ui.newArrivals', 'New arrivals')" @quick-buy="quickBuy" />

    <!-- ▆▆▆▆ Shop by brand: one row, See all opens the rest ▆▆▆▆ -->
    <section v-if="brands.length" class="b-sec b-wrap">
      <header class="b-head">
        <h2>{{ t("besti.ui.shopByBrand", "Shop by brand") }}</h2>
        <button v-if="brands.length > brandRow" class="b-more" type="button" @click="all_brands = !all_brands">
          {{ all_brands ? t("besti.menu.showFewer", "Show fewer") : t("besti.home.allBrands", "See all brands") }}<span class="ms b-flip">{{ all_brands ? "expand_less" : "chevron_right" }}</span>
        </button>
      </header>
      <div :style="{ '--cols': Math.min(brandRow, brands.length) }" class="b-brands">
        <router-link v-for="b in shownBrands" :key="b" :to="brandTo(b)">{{ b }}</router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ A row for every other tag in use ("<Tag> Items") ▆▆▆▆ -->
    <besti-rail
      v-for="row in tagRows"
      :key="row.tag"
      :more-to="tagTo(row.tag)"
      :products="row.products"
      :title="t('besti.home.tagItems', '{tag} Items', { tag: tagTitle(row.tag) })"
      class="b-wrap"
      @quick-buy="quickBuy"
    />

    <!-- ▆▆▆▆ Recently viewed (this browser) ▆▆▆▆ -->
    <section v-if="recent.length" class="b-sec b-wrap">
      <header class="b-head">
        <h2>{{ t("besti.ui.recentlyViewed", "Recently viewed") }}</h2>
        <button class="b-more" type="button" @click="clearRecent">{{ t("besti.ui.clear", "Clear") }}</button>
      </header>
      <div class="b-recent">
        <router-link v-for="p in recent" :key="p.id" :to="productTo(p)" class="b-mini -box">
          <img :src="thumb(p)" alt="" loading="lazy" />
          <span><b>{{ p.title }}</b><em><u-price :amount="nowOf(p)" :currency="currency" /></em></span>
        </router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ Tips and guides: the four newest articles, last ▆▆▆▆ -->
    <section v-if="posts.length" class="b-sec b-wrap">
      <header class="b-head">
        <h2>{{ t("besti.ui.tipsAndGuides", "Tips and guides") }}</h2>
        <router-link :to="blogTo" class="b-more">{{ t("besti.ui.allArticles", "All articles") }}<span class="ms b-flip">chevron_right</span></router-link>
      </header>
      <div class="b-blog">
        <router-link v-for="a in posts" :key="a.id" :to="postTo(a)" class="b-post">
          <div class="b-post__img">
            <img v-if="a.image" :src="postImage(a)" :srcset="postSrcset(a)" alt="" loading="lazy" sizes="(max-width: 600px) 78vw, (max-width: 1280px) 45vw, 340px" @error="dropSrcset" />
          </div>
          <time :datetime="a.created_at">{{ dateParts(a.created_at).full }}</time>
          <h3>{{ a.title }}</h3>
          <p v-if="a.desc || a.description">{{ a.desc || a.description }}</p>
        </router-link>
      </div>
    </section>

    <kalio-quick-buy v-model="sheet" :product="picked" />
  </div>
</template>

<script>
import { currentCurrency } from "../region-switcher/region";
import { t } from "../kalio/i18n/kalio-i18n";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import BestiCard from "./BestiCard.vue";
import BestiRail from "./BestiRail.vue";
import BestiPhoto from "./BestiPhoto.vue";
import BestiDealOfDay from "./BestiDealOfDay.vue";
import KalioQuickBuy from "../kalio/KalioQuickBuy.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute, dropSrcset, photoSrcset } from "../kalio/kalio-catalog";
import { dateParts, journalPage, journalRoute, postRoute } from "../kalio/pages/kalio-journal";
import {
  brandRoute,
  brandsOf,
  catalogue,
  categoryLine,
  catTiles,
  dealOfTheDay,
  dealsOf,
  forgetViewed,
  isBestSellerTag,
  isNewTag,
  mixByCategory,
  moneyOf,
  moneyText,
  photoOf,
  tagged,
  tagTitle,
  viewedIds,
  withPhoto,
} from "./besti";

const POWER = /power|batter|charg|energy|solar|\brv\b|generator/i;

export default {
  name: "BestiHome",
  components: { BestiCard, BestiRail, BestiPhoto, BestiDealOfDay, KalioQuickBuy },
  mixins: [CurrencyMixin],
  inject: ["$shop"],

  data: () => ({
    hero_seen: true,
    cats: [],
    products: [],
    tags: new Map(),
    ready: false,
    tags_ready: false,
    at: 0,
    pause: false,
    tab: null,
    all_brands: false,
    brandRow: 8,
    posts: [],
    recent_ids: [],
    sheet: false,
    picked: null,
    width: typeof window !== "undefined" ? window.innerWidth : 1440,
  }),

  computed: {
    currency() {
      return currentCurrency();
    },
    allTo() {
      return catalogueRoute();
    },
    dealsTo() {
      return dealsRoute();
    },
    newTo() {
      return catalogueRoute({ sort: "newest" });
    },
    blogTo() {
      return journalRoute();
    },
    withProducts() {
      const ids = new Set(this.products.map((p) => p.category_id));
      return this.cats.filter((c) => ids.has(c.id));
    },

    /* ── Hero ── */
    banner() {
      const wide = withPhoto(this.withProducts, "wide");
      const power = this.withProducts.filter((c) => POWER.test(`${c.title} ${c.name}`));
      const cat = power.find((c) => photoOf(c, "wide")) || (wide.length > 1 ? wide[wide.length - 1] : null) || power[0] || null;
      if (!cat) return null;
      const isPower = POWER.test(`${cat.title} ${cat.name}`);
      const links = (isPower ? power : [cat]).slice(0, 2);
      return {
        cat,
        links,
        eyebrow: isPower ? t("besti.home.banner.powerEyebrow", "Off-grid and on the road") : t("besti.home.banner.eyebrow", "Featured department"),
        title: isPower ? t("besti.home.banner.powerTitle", "Power that goes where you go") : t("besti.home.banner.title", "{name}, picked for you", { name: cat.title || cat.name }),
        cta: isPower ? t("besti.home.banner.powerCta", "Shop portable power") : t("besti.home.banner.cta", "Shop {name}", { name: cat.title || cat.name }),
      };
    },
    slides() {
      const wide = withPhoto(this.withProducts, "wide").filter((c) => !this.banner || c.id !== this.banner.cat.id || withPhoto(this.withProducts, "wide").length < 2);
      if (wide.length) return wide;
      /* No wide photos at all: the categories with the biggest deals, as collages. */
      return this.withProducts.slice(0, 4);
    },
    slide() {
      return this.slides[this.at % Math.max(1, this.slides.length)];
    },
    sideTiles() {
      const used = new Set(this.slides.map((c) => c.id));
      const pool = this.withProducts.filter((c) => !used.has(c.id));
      const tall = withPhoto(pool, "portrait");
      const square = withPhoto(pool, "square");
      return [...tall, ...square, ...pool].filter((c, i, all) => all.indexOf(c) === i).slice(0, 2);
    },

    /* ── Departments ── */
    tiles() {
      return catTiles(this.cats);
    },

    /* ── Deals ── */
    deals() {
      return dealsOf(this.$shop, this.products);
    },
    dotd() {
      return dealOfTheDay(this.$shop, this.products);
    },
    moreDeals() {
      if (!this.dotd) return [];
      return mixByCategory(this.deals.filter((p) => p.id !== this.dotd.id && p.category_id !== this.dotd.category_id), 3);
    },
    dealTabs() {
      const ids = new Set(this.deals.map((p) => p.category_id));
      return this.cats.filter((c) => ids.has(c.id)).slice(0, 6);
    },
    topDeals() {
      const pool = this.deals.filter((p) => !this.dotd || p.id !== this.dotd.id);
      const list = this.tab ? pool.filter((p) => p.category_id === this.tab) : mixByCategory(pool, 15);
      /* Full rows only, never a hole: as many whole rows as the deals fill
         (five to a row on a computer, four on a laptop, three on a tablet,
         two on a phone; two rows, three on a phone). Fewer than one row
         stays one short row. */
      const w = this.width;
      const cols = w >= 1280 ? 5 : w >= 900 ? 4 : w >= 600 ? 3 : 2;
      const rows = w >= 600 ? 2 : 3;
      if (list.length <= cols) return list;
      return list.slice(0, Math.min(Math.floor(list.length / cols), rows) * cols);
    },

    /* ── Mosaic ── */
    mosaic() {
      const used = new Set([...this.slides, ...this.sideTiles].map((c) => c.id));
      const pool = this.withProducts.filter((c) => !used.has(c.id));
      const sq = withPhoto(pool, "square");
      const rest = pool.filter((c) => !sq.includes(c));
      const list = [...sq, ...rest].slice(0, 5);
      return list.length === 5 ? list : [];
    },

    /* ── Best sellers ── */
    bento() {
      const tag = [...this.tags.keys()].find(isBestSellerTag);
      const list = tag ? this.tags.get(tag).filter((p) => p.icon) : [];
      if (!list.length) return { big: null, rest: [], cols: 4, tag: null };
      const [big, ...others] = list;
      /* Two even rows beside the big card: 2 × 4, or fewer columns when there are fewer. */
      const cols = Math.max(1, Math.min(4, Math.floor(others.length / 2)));
      return { big, rest: others.slice(0, cols * 2), cols, tag };
    },

    /* ── New arrivals: the shop's new-arrival tag, else the newest ── */
    newest() {
      if (!this.ready) return null;
      const tag = [...this.tags.keys()].find(isNewTag);
      const tagged = tag ? this.tags.get(tag) : [];
      if (tagged.length >= 4) return mixByCategory(tagged, 12);
      return mixByCategory(
        [...this.products].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)) || b.id - a.id),
        12,
      );
    },

    /* ── Brands ── */
    brands() {
      return brandsOf(this.products);
    },
    shownBrands() {
      return this.all_brands ? this.brands : this.brands.slice(0, this.brandRow);
    },

    /* ── Every other tag: "<Tag> Items" ── */
    tagRows() {
      return [...this.tags.entries()]
        .filter(([t, list]) => !isBestSellerTag(t) && !isNewTag(t) && list.length)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 6)
        .map(([tag, list]) => ({ tag, products: mixByCategory(list, 12) }));
    },

    /* ── Recently viewed ── */
    recent() {
      const map = new Map(this.products.map((p) => [p.id, p]));
      return this.recent_ids.map((id) => map.get(id)).filter(Boolean).slice(0, 6);
    },
  },

  watch: {
    slides(list) {
      if (this.at >= list.length) this.at = 0;
      this.$nextTick(() => this.watchHero());
      /* The next slides' photos load and decode now, so a slide never
         appears half-drawn (seen live on a first visit). */
      for (const c of list) {
        const ph = photoOf(c, "wide");
        if (!ph) continue;
        const img = new Image();
        img.decoding = "async";
        img.src = ph.src;
        img.decode?.().catch(() => {});
      }
    },
  },

  mounted() {
    aisles().then((list) => (this.cats = list));
    catalogue().then((list) => {
      this.products = list;
      this.ready = true;
    });
    tagged().then((map) => {
      this.tags = map;
      this.tags_ready = true;
    });
    this.recent_ids = viewedIds();
    journalPage({ page: 1, limit: 8 })
      .then(({ articles }) => (this.posts = articles.slice(0, 4)))
      .catch(() => (this.posts = []));
    this.onResize = () => (this.width = window.innerWidth);
    window.addEventListener("resize", this.onResize, { passive: true });
    this.restartHero();
    this.watchHero();
  },

  beforeUnmount() {
    clearInterval(this.timer);
    this.heroIo?.disconnect();
    window.removeEventListener("resize", this.onResize);
  },

  methods: {
    /* The hero turns every 7 seconds, not while the pointer is on it, nor
       while it is out of view; back in view, it waits a whole 7 seconds
       before it turns again (a slide never changes as you come back to it). */
    restartHero() {
      clearInterval(this.timer);
      const still = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (still) return;
      this.timer = setInterval(() => {
        if (!this.pause && this.hero_seen && !document.hidden && this.slides.length > 1) this.at = (this.at + 1) % this.slides.length;
      }, 7000);
    },
    watchHero() {
      const el = this.$refs.hero;
      if (!el || this.heroIo || typeof IntersectionObserver === "undefined") return;
      this.heroIo = new IntersectionObserver((entries) => {
        const seen = entries.some((e) => e.isIntersecting);
        if (seen && !this.hero_seen) this.restartHero();
        this.hero_seen = seen;
      });
      this.heroIo.observe(el);
    },
    photoOf,
    tagTitle,
    dateParts,
    dropSrcset,
    go(d) {
      const n = this.slides.length;
      this.at = (this.at + d + n) % n;
    },
    catTo(c) {
      return aisleRoute(c);
    },
    catIcon(c) {
      return window.CDN.GET_CATEGORY_ICON(c.id, 256);
    },
    inCategory(c) {
      return this.products.filter((p) => p.category_id === c.id);
    },
    sidePhoto(c) {
      return photoOf(c, "portrait") || photoOf(c, "square");
    },
    line(c) {
      return categoryLine(this.$shop, this.products, c.id, this.currency, (n) => moneyText(n, this.currency, Math.round(n) === n));
    },
    tagTo(tag) {
      return { name: window.$storefront.routes.SHOP_PAGE, query: { search: tag } };
    },
    brandTo(b) {
      return brandRoute(b);
    },
    productTo(p) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p.id } };
    },
    thumb(p) {
      return window.CDN.GET_SHOP_IMAGE_PATH(p.icon, 128);
    },
    nowOf(p) {
      return moneyOf(this.$shop, p, null, this.currency).now;
    },
    clearRecent() {
      forgetViewed();
      this.recent_ids = [];
    },
    postTo(a) {
      return postRoute(a);
    },
    postImage(a) {
      return window.CDN.GET_SHOP_IMAGE_PATH(a.image, null);
    },
    postSrcset(a) {
      return photoSrcset(this.postImage(a));
    },
    quickBuy(p) {
      this.picked = p;
      this.sheet = true;
    },
  },
};
</script>
