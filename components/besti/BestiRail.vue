<!--
  Besti — a row of product cards on one line that scrolls sideways, with
  round arrows at its ends ("New arrivals", "<Tag> Items", the product
  page's "Related products" and "More in <category>"). Six cards to a
  computer screen, five on a laptop, two and a half on a phone. A row with
  nothing to show renders nothing; while it loads it shows skeletons.
-->
<template>
  <section v-if="products === null || products.length" :aria-label="title" class="b-sec">
    <header class="b-head">
      <h2>{{ title }}</h2>
      <slot name="head"></slot>
      <router-link v-if="moreTo" :to="moreTo" class="b-more">{{ moreLabel || t("besti.seeAll", "See all") }}<span class="ms b-flip">chevron_right</span></router-link>
      <button v-else-if="moreAction" class="b-more" type="button" @click="$emit('more')">{{ moreLabel || t("besti.seeAll", "See all") }}</button>
    </header>
    <div class="b-rail">
      <div ref="track" class="b-rail__track" @scroll.passive="measure">
        <template v-if="products === null">
          <div v-for="n in 6" :key="'s' + n" aria-hidden="true" class="b-card -skeleton"><i></i><b></b><b class="-short"></b></div>
        </template>
        <template v-else>
          <slot :products="products">
            <besti-card v-for="p in products" :key="p.id" :product="p" @quick-buy="$emit('quick-buy', $event)" />
          </slot>
        </template>
      </div>
      <button v-show="!at_start" :aria-label="t('besti.ui.scrollBack', 'Scroll back')" class="b-arrow -l" type="button" @click="nudge(-1)"><span class="ms b-flip">chevron_left</span></button>
      <button v-show="!at_end" :aria-label="t('besti.ui.scrollForward', 'Scroll forward')" class="b-arrow -r" type="button" @click="nudge(1)"><span class="ms b-flip">chevron_right</span></button>
    </div>
  </section>
</template>

<script>
import BestiCard from "./BestiCard.vue";

export default {
  name: "BestiRail",
  components: { BestiCard },
  props: {
    title: { type: String, required: true },
    /** null while loading. */
    products: { type: Array, default: null },
    moreTo: { type: Object, default: null },
    moreLabel: { type: String, default: "" },
    moreAction: Boolean,
  },
  emits: ["quick-buy", "more"],
  data: () => ({ at_start: true, at_end: false }),
  watch: {
    products() {
      this.$nextTick(this.measure);
    },
  },
  mounted() {
    this.measure();
    this.onResize = () => this.measure();
    window.addEventListener("resize", this.onResize, { passive: true });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    measure() {
      const t = this.$refs.track;
      if (!t) return;
      const left = Math.abs(t.scrollLeft);
      this.at_start = left < 4;
      this.at_end = left + t.clientWidth >= t.scrollWidth - 4;
    },
    nudge(dir) {
      const t = this.$refs.track;
      if (!t) return;
      /* Right to left, the track scrolls the other way (scrollLeft runs negative). */
      const sign = getComputedStyle(t).direction === "rtl" ? -1 : 1;
      t.scrollBy({ left: sign * dir * Math.round(t.clientWidth * 0.8), behavior: "smooth" });
    },
  },
};
</script>
