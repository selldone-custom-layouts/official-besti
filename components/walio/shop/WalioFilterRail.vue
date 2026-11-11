<!--
  Walio — the filter column (shop page design B, given to Walio on
  7 November 2026: kalio-design/tario-options/shop-b.html).

  Beside the grid on a computer: "Filters" with Clear all, an "On sale only"
  switch, the price with quick ranges, then each of the aisle's own filter
  groups (sizes as buttons, the rest as ticks), the first three open and
  the others folded. Every tick applies at once. On a phone the column
  becomes a "Filters | Sort" bar over the grid; Filters opens the same
  groups on a full screen with Show results.

  `compact` draws only the bar (the seller page, whose column is the
  seller's card). The groups are the listing's live Selldone filter record
  (walio-filters.ts); the page hands every change to the listing.
-->
<template>
  <!-- Besti (digini-design/shop-b.html): Filters with Clear all, the
       departments (ten, the rest behind "N more departments", the open one
       always shown), price with a slider and two short boxes, On sale only,
       brands, colours as swatches, the other variant values, then the
       category's own spec filters (the first open, the rest folded). -->
  <aside v-if="!compact" :aria-label="t('besti.ui.filters', 'Filters')" class="w-rail b-rail-f">
    <header class="w-rail__hd">
      <b>{{ t("besti.ui.filters", "Filters") }}</b>
      <button v-if="on_count" class="w-rail__clear" type="button" @click="clearAll">{{ t("besti.ui.clearAll", "Clear all") }}</button>
    </header>
    <details v-if="cats.length" class="w-grp" open>
      <summary>{{ t("besti.ui.department", "Department") }}<v-icon size="22">expand_more</v-icon></summary>
      <nav class="b-deps" :aria-label="t('besti.ui.departments', 'Departments')">
        <router-link
          v-for="c in shownCats"
          :key="c.id"
          :aria-current="c.name === current ? 'page' : undefined"
          :class="{ '-on': c.name === current }"
          :to="catTo(c)"
          >{{ c.title || c.name }}</router-link
        >
        <button v-if="cats.length > 10" class="b-deps__more" type="button" @click="all_cats = !all_cats">
          <v-icon size="18">{{ all_cats ? "expand_less" : "expand_more" }}</v-icon
          >{{ all_cats ? t("besti.filter.fewerDepartments", "Fewer departments") : t("besti.filter.moreDepartments", { one: "{n} more department", other: "{n} more departments" }, { n: cats.length - 10 }) }}
        </button>
      </nav>
    </details>
    <details v-if="has_price" class="w-grp" open>
      <summary>{{ t("besti.ui.price", "Price") }}<v-icon size="22">expand_more</v-icon></summary>
      <v-range-slider
        v-model="price_draft"
        :max="price_max"
        :min="price_min"
        :step="price_step"
        class="w-rail__slider"
        color="primary"
        hide-details
        thumb-size="18"
        track-size="3"
        @end="applyPrice(price_draft)"
      ></v-range-slider>
      <div class="b-prange">
        <label><span>{{ sign }}</span><input :value="Math.round(price_draft[0])" :aria-label="t('besti.ui.lowestPrice', 'Lowest price')" inputmode="numeric" @change="typed(0, $event)" /></label>
        <em>{{ t("besti.filter.to", "to") }}</em>
        <label><span>{{ sign }}</span><input :value="Math.round(price_draft[1])" :aria-label="t('besti.ui.highestPrice', 'Highest price')" inputmode="numeric" @change="typed(1, $event)" /></label>
      </div>
    </details>
    <details v-if="!ignore.includes('discount')" class="w-grp" open>
      <summary>{{ t("besti.ui.deals", "Deals") }}<v-icon size="22">expand_more</v-icon></summary>
      <label class="t-switch">
        <span>{{ t("besti.ui.onSaleOnly", "On sale only") }}</span>
        <input :checked="!!value.only_has_discount" type="checkbox" @change="toggleDeals" />
        <i></i>
      </label>
    </details>
    <details v-for="(group, i) in ordered" :key="group.kind + group.key" :open="i < 3" class="w-grp">
      <summary>
        {{ group.label }}<b v-if="picked(group).length" class="w-rail__n">{{ picked(group).length }}</b>
        <v-icon size="22">expand_more</v-icon>
      </summary>
      <div v-if="group.key === 'colors'" class="b-swfilter">
        <button
          v-for="v in group.values"
          :key="v"
          :aria-label="colourName(v)"
          :aria-pressed="picked(group).includes(v) ? 'true' : 'false'"
          :class="{ '-on': picked(group).includes(v) }"
          :style="{ '--sw': swatchBg(v) }"
          :title="colourName(v)"
          type="button"
          @click="toggle(group, v)"
        ></button>
      </div>
      <div v-else-if="group.kind === 'variant'" class="w-rail__pills">
        <button
          v-for="v in group.values"
          :key="v"
          :aria-pressed="picked(group).includes(v)"
          :class="{ '-on': picked(group).includes(v) }"
          type="button"
          @click="toggle(group, v)"
        >
          {{ valueLabel(v) }}
        </button>
      </div>
      <template v-else>
        <label v-for="v in group.values" :key="v" :title="valueLabel(v)" class="t-check">
          <input :checked="picked(group).includes(v)" type="checkbox" @change="toggle(group, v)" />
          <span class="t-check__box"><v-icon size="16">check</v-icon></span>
          <span class="t-check__t">{{ valueLabel(v) }}</span>
        </label>
      </template>
    </details>
  </aside>

  <!-- The phone's bar (and the seller page's on every screen) -->
  <div :class="{ '-compact': compact }" class="w-split">
    <button type="button" @click="panel = true">
      <v-icon size="20">tune</v-icon>{{ t("besti.ui.filters", "Filters") }}<b v-if="on_count" class="w-rail__n">{{ on_count }}</b>
    </button>
    <v-menu location="bottom end" offset="6">
      <template v-slot:activator="{ props }">
        <button type="button" v-bind="props"><v-icon size="20">swap_vert</v-icon>{{ sortName(sort, sortFallback) }}</button>
      </template>
      <div class="t-dd -sort">
        <button
          v-for="s in SORTS"
          :key="s.val"
          :class="{ '-on': s.val === sort }"
          class="t-dd__opt"
          type="button"
          @click="$emit('update:sort', s.val)"
        >
          {{ s.name }}<v-icon v-if="s.val === sort" size="18">check</v-icon>
        </button>
      </div>
    </v-menu>
  </div>

  <teleport to="body">
    <transition name="t-fade">
      <div v-if="panel" aria-hidden="true" class="t-fscrim" @click="panel = false"></div>
    </transition>
    <transition name="t-up">
      <div v-if="panel" :aria-label="t('besti.ui.filters', 'Filters')" aria-modal="true" class="t-fpanel w-fpanel" role="dialog" @keydown.esc="panel = false">
        <div class="t-fpanel__in">
          <header class="t-fpanel__h">
            {{ t("besti.ui.filters", "Filters") }}
            <button :aria-label="t('besti.ui.close', 'Close')" class="t-fpanel__x" type="button" @click="panel = false"><v-icon size="24">close</v-icon></button>
          </header>
          <div class="t-fpanel__b">
            <section v-if="!ignore.includes('discount')" class="t-fgrp">
              <label class="t-switch">
                <span>{{ t("besti.ui.onSaleOnly", "On sale only") }}</span>
                <input v-model="draft.only_has_discount" type="checkbox" />
                <i></i>
              </label>
            </section>
            <section v-if="has_price" class="t-fgrp">
              <h5>{{ t("besti.ui.price", "Price") }}</h5>
              <v-range-slider v-model="draft_price" :max="price_max" :min="price_min" :step="price_step" color="primary" hide-details />
              <div class="w-rail__prices">
                <span><u-price :amount="draft_price[0]" /></span>–<span><u-price :amount="draft_price[1]" /></span>
              </div>
            </section>
            <section v-for="group in ordered" :key="'p' + group.kind + group.key" class="t-fgrp">
              <h5>{{ group.label }}</h5>
              <div v-if="group.key === 'colors'" class="b-swfilter">
                <button
                  v-for="v in group.values"
                  :key="v"
                  :aria-label="colourName(v)"
                  :aria-pressed="draftPicked(group).includes(v) ? 'true' : 'false'"
                  :class="{ '-on': draftPicked(group).includes(v) }"
                  :style="{ '--sw': swatchBg(v) }"
                  :title="colourName(v)"
                  type="button"
                  @click="draftToggle(group, v)"
                ></button>
              </div>
              <div v-else class="t-fgrp__opts">
                <button
                  v-for="v in group.values"
                  :key="v"
                  :aria-pressed="draftPicked(group).includes(v)"
                  :class="{ '-on': draftPicked(group).includes(v) }"
                  class="t-opt"
                  type="button"
                  @click="draftToggle(group, v)"
                >
                  {{ valueLabel(v) }}
                </button>
              </div>
            </section>
          </div>
          <footer class="t-fpanel__f">
            <button class="t-btn -line" type="button" @click="draftClear">{{ t("besti.ui.clearAll", "Clear all") }}</button>
            <button class="t-btn -main" type="button" @click="draftApply">{{ t("besti.ui.showResults", "Show results") }}</button>
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { t } from "../../kalio/i18n/kalio-i18n";
import { money as regionMoney, currentCurrency, formatMoney, signOf } from "../../region-switcher/region";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { PriceHelper } from "@selldone/core-js/helper";
import { SORTS, clone, countOn, groupsOf, picked, sortName, valueLabel, withGroup } from "./walio-filters";
import { colourName, swatchBg } from "../../besti/besti";
import { aisleRoute } from "../../kalio/kalio-catalog";

export default {
  name: "WalioFilterRail",
  components: { UPrice },
  mixins: [CurrencyMixin],
  inject: ["$shop"],
  emits: ["update:modelValue", "update:sort"],

  props: {
    filters: { type: Object, default: null },
    modelValue: { type: Object, default: null },
    sort: { type: String, default: null },
    sortFallback: { type: String, default: "" },
    compact: Boolean,
    /** The departments, and the one open (Besti). */
    cats: { type: Array, default: () => [] },
    current: { type: String, default: null },
  },

  data() {
    return {
      SORTS,
      panel: false,
      price_draft: [0, 0],
      draft: clone(null),
      draft_price: [0, 0],
      all_cats: false,
    };
  },

  computed: {
    value() {
      return clone(this.modelValue);
    },
    ignore() {
      return this.filters?.ignore || [];
    },
    groups() {
      return groupsOf(this.filters);
    },
    /* Brands, colours, the other variant values, then the spec keys. */
    ordered() {
      const g = this.groups;
      const rank = (x) => (x.kind === "brand" ? 0 : x.key === "colors" ? 1 : x.kind === "variant" ? 2 : 3);
      return [...g].sort((a, b) => rank(a) - rank(b));
    },
    /* Ten departments; the open one is always among them. */
    shownCats() {
      if (this.all_cats || this.cats.length <= 10) return this.cats;
      const first = this.cats.slice(0, 10);
      const open = this.cats.find((c) => c.name === this.current);
      if (open && !first.includes(open)) first[9] = open;
      return first;
    },
    on_count() {
      return countOn(this.modelValue);
    },
    currency() {
      return currentCurrency();
    },
    price_rows() {
      return (this.filters?.prices || []).filter((row) => this.rate(row.currency, true));
    },
    has_price() {
      return !this.ignore.includes("price") && this.price_rows.length && this.price_max > this.price_min;
    },
    price_min() {
      const values = this.price_rows.map((row) => row.min * this.rate(row.currency, true));
      return values.length ? Math.floor(Math.min(...values)) : 0;
    },
    price_max() {
      const values = this.price_rows.map((row) => row.max * this.rate(row.currency, true));
      return values.length ? Math.ceil(Math.max(...values)) : 0;
    },
    price_step() {
      const span = this.price_max - this.price_min;
      return span > 200 ? 5 : span > 40 ? 1 : 0.5;
    },
    /* The visitor's currency sign for the min / max boxes. */
    sign() {
      return signOf(this.currency || currentCurrency());
    },
    /* Three quick ranges cut from the aisle's own prices. */
    quick() {
      const lo = this.price_min;
      const hi = this.price_max;
      if (hi - lo < 3) return [];
      const a = Math.round(lo + (hi - lo) / 3);
      const b = Math.round(lo + ((hi - lo) * 2) / 3);
      const cur = (n) => formatMoney(n, this.currency, { short: true });
      return [
        { label: t("besti.filter.under", "Under {amount}", { amount: cur(a) }), range: [lo, a] },
        { label: t("besti.filter.between", "{from} – {to}", { from: cur(a), to: cur(b) }), range: [a, b] },
        { label: t("besti.filter.andUp", "{amount} & up", { amount: cur(b) }), range: [b, hi] },
      ];
    },
  },

  watch: {
    modelValue: {
      handler(v) {
        this.price_draft = this.rangeOf(v);
      },
      immediate: true,
    },
    price_max() {
      this.price_draft = this.rangeOf(this.modelValue);
    },
    panel(open) {
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (open) {
        this.draft = clone(this.modelValue);
        this.draft_price = this.rangeOf(this.modelValue);
      }
    },
  },

  beforeUnmount() {
    if (this.panel) document.documentElement.style.overflow = "";
  },

  methods: {
    /* An amount in its own currency, shown in the visitor's (region switcher). */
    rsMoney(n, from, short = "auto") {
      return regionMoney(n, from, { short });
    },
    sortName,
    valueLabel,
    swatchBg,
    colourName,
    catTo(c) {
      return aisleRoute(c);
    },
    typed(i, e) {
      const n = Number(String(e.target.value).replace(/[^0-9.]/g, ""));
      if (!Number.isFinite(n)) return;
      const next = [...this.price_draft];
      next[i] = Math.min(this.price_max, Math.max(this.price_min, n));
      if (next[0] > next[1]) next.reverse();
      this.applyPrice(next);
    },
    picked(group) {
      return picked(this.modelValue, group);
    },
    draftPicked(group) {
      return picked(this.draft, group);
    },
    rate(currency, toUser) {
      return toUser
        ? PriceHelper.getExchangeRateValue(this.$shop, currency, this.currency, null)
        : PriceHelper.getExchangeRateValue(this.$shop, this.currency, currency, null);
    },
    pricesFor([lo, hi]) {
      if (lo <= this.price_min && hi >= this.price_max) return null;
      const out = {};
      for (const row of this.price_rows) {
        const r = this.rate(row.currency, false) || 1;
        out[row.currency] = [lo * r, hi * r];
      }
      return out;
    },
    rangeOf(filter) {
      const row = this.price_rows[0];
      const set = row && filter?.prices?.[row.currency];
      if (!set) return [this.price_min, this.price_max];
      const r = this.rate(row.currency, true) || 1;
      return [Math.max(this.price_min, set[0] * r), Math.min(this.price_max, set[1] * r)];
    },
    emit(next) {
      this.$emit("update:modelValue", next);
    },
    toggleDeals() {
      const next = clone(this.modelValue);
      next.only_has_discount = !next.only_has_discount;
      this.emit(next);
    },
    toggle(group, v) {
      const now = this.picked(group);
      this.emit(withGroup(this.modelValue, group, now.includes(v) ? now.filter((x) => x !== v) : [...now, v]));
    },
    applyPrice(range) {
      const next = clone(this.modelValue);
      next.prices = this.pricesFor(range);
      this.price_draft = [...range];
      this.emit(next);
    },
    clearAll() {
      this.emit(clone(null));
    },
    draftToggle(group, v) {
      const now = this.draftPicked(group);
      this.draft = withGroup(this.draft, group, now.includes(v) ? now.filter((x) => x !== v) : [...now, v]);
    },
    draftClear() {
      this.draft = clone(null);
      this.draft_price = [this.price_min, this.price_max];
    },
    draftApply() {
      const next = clone(this.draft);
      next.prices = this.has_price ? this.pricesFor(this.draft_price) : null;
      this.panel = false;
      this.emit(next);
    },
  },
};
</script>
