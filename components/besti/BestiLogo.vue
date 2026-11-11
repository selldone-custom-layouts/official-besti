<!--
  Besti — the wordmark.

  The brand name from kalio-brand.ts (the one line to change), in lower
  case, heavy, navy ink (white on the navy footer). Every "i" is a dotless
  ı whose dot is a small yellow square, so the yellow accent sits in the
  logo itself. With no brand name set, the shop's own title is drawn the
  same way.
-->
<template>
  <component :is="to ? 'router-link' : 'span'" :aria-label="t('besti.logo.home', '{name} home', { name: word })" :class="{ '-light': light }" :to="to" class="b-logo">
    <template v-for="(part, i) in parts" :key="i"
      ><span v-if="part === 'i'" aria-hidden="true" class="b-logo__i">ı</span><template v-else>{{ part }}</template></template
    >
  </component>
</template>

<script>
import { BRAND } from "../kalio/kalio-brand";

export default {
  name: "BestiLogo",
  inject: { $shop: { default: null } },
  props: {
    light: Boolean,
    to: { type: [Object, String], default: () => ({ path: "/" }) },
  },
  computed: {
    word() {
      return (BRAND.name || this.$shop?.title || "").toLowerCase();
    },
    /* "besti" → ["best", "i"]: plain runs and each i on its own. */
    parts() {
      return this.word.split(/(i)/).filter(Boolean);
    },
  },
};
</script>
