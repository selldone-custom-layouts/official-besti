<!--
  Besti — a deal's countdown.

  It is handed the deal's own end (besti.ts dealEnd: Selldone's PriceHelper
  rule, the chosen variant's dates when that variant has its own pricing)
  and counts on the page's one shared ticker (besti.ts tick), so a grid of
  cards never runs one interval each, and only this small piece re-renders
  every second. A deal with no end date, or one that has ended, shows
  nothing.

    line   — the quiet line on product cards: "Ends in 364d 23:15:07"
    strip  — the navy strip in the header: "Ends in 364d 23:15:07"
    blocks — the Deal of the Day: "Ends in" over days, hrs, min and sec
-->
<template>
  <span v-if="left && mode === 'line'" :title="title" class="b-cd">
    <span class="ms">schedule</span><span class="b-cd__w">{{ t("besti.ui.endsIn", "Ends in") }} </span><b>{{ left.text }}</b>
  </span>
  <span v-else-if="left && mode === 'strip'" :title="title" class="b-strip__clock">{{ t("besti.ui.endsIn", "Ends in") }} <b>{{ left.text }}</b></span>
  <div v-else-if="left && mode === 'blocks'" :title="title" class="b-cd-blocks">
    <em>{{ t("besti.ui.endsIn", "Ends in") }}</em>
    <div aria-live="off" class="b-count" :class="{ '-days': left.d > 0 }">
      <span v-if="left.d"><b>{{ left.d }}</b>{{ t("besti.clock.dayWord", { one: "day", other: "days" }, { n: left.d }) }}</span><span><b>{{ left.h }}</b>{{ t("besti.clock.hrs", "hrs") }}</span><span><b>{{ left.m }}</b>{{ t("besti.clock.min", "min") }}</span><span><b>{{ left.s }}</b>{{ t("besti.clock.sec", "sec") }}</span>
    </div>
  </div>
</template>

<script>
import { startClock, tick, timeLeft } from "./besti";
import { formatDate, t } from "../kalio/i18n/kalio-i18n";

export default {
  name: "BestiDealClock",
  props: {
    /** The deal's end (a Date), or null for no clock. */
    end: { type: Date, default: null },
    mode: { type: String, default: "line" },
  },
  computed: {
    left() {
      return timeLeft(this.end, tick.now);
    },
    title() {
      return this.end ? t("besti.clock.title", "Deal ends {when}", { when: formatDate(this.end, { dateStyle: "medium", timeStyle: "short" }) }) : null;
    },
  },
  mounted() {
    startClock();
  },
};
</script>
