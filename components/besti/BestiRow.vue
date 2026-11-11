<!--
  Besti — a row that reads its own products ("More in <category>", the
  404's "Today's top deals", a search's "Popular right now"): one
  products.list call with the caller's category, sort and filter, drawn as a
  BestiRail. Nothing here names a product. A row with nothing to show
  renders nothing; `lazy` rows wait until they are about to scroll in.
-->
<template>
  <div ref="root" class="b-row">
    <besti-rail :more-to="moreTo" :more-label="moreLabel" :products="busy ? null : products" :title="title" @quick-buy="quickBuy" />
    <kalio-quick-buy v-model="sheet" :product="picked" />
  </div>
</template>

<script>
import BestiRail from "./BestiRail.vue";
import KalioQuickBuy from "../kalio/KalioQuickBuy.vue";
import { catalogueById, mixByCategory } from "./besti";

export default {
  name: "BestiRow",
  components: { BestiRail, KalioQuickBuy },
  props: {
    title: { type: String, required: true },
    sort: { type: String, default: "bestselling" },
    filter: { type: Object, default: null },
    dir: { type: String, default: null },
    limit: { type: Number, default: 12 },
    moreTo: { type: Object, default: null },
    moreLabel: { type: String, default: "" },
    lazy: Boolean,
    spread: Boolean,
    exclude: { type: [Number, String, Array], default: null },
  },
  emits: ["loaded"],
  data: () => ({ products: [], busy: true, sheet: false, picked: null }),
  watch: {
    dir() {
      this.fetch();
    },
  },
  mounted() {
    if (this.lazy && "IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            this.observer.disconnect();
            this.fetch();
          }
        },
        { rootMargin: "600px 0px" },
      );
      this.observer.observe(this.$refs.root);
    } else this.fetch();
  },
  beforeUnmount() {
    this.observer?.disconnect();
  },
  methods: {
    fetch() {
      this.busy = true;
      const options = { products_only: true, sort: this.sort, available: true };
      if (this.filter) options.filter = JSON.stringify(this.filter);
      const skip = new Set([].concat(this.exclude ?? []).map(String));
      Promise.all([window.$storefront.products.list(this.dir, 0, this.limit + skip.size, options), catalogueById()])
        .then(([{ products }, rich]) => {
          const list = (products || [])
            .filter((p) => p.icon && !skip.has(String(p.id)))
            .slice(0, this.limit)
            .map((p) => rich.get(p.id) || p);
          this.products = this.spread ? mixByCategory(list, list.length) : list;
        })
        .catch(() => (this.products = []))
        .finally(() => {
          this.busy = false;
          this.$emit("loaded", this.products);
        });
    },
    quickBuy(p) {
      this.picked = p;
      this.sheet = true;
    },
  },
};
</script>
