<!--
  Besti — the Deal of the Day, wide.

  A yellow block with the saving in percent and "Ends in" over the days,
  hours, minutes and seconds left on this deal (its own end date, the picked
  colour's when that colour has its own pricing; no end date, no clock), the
  product big, its colours, the price, Add to cart and Compare, and "More top
  deals" beside it. The deal is one of the shop's biggest savings, a
  different one each day (besti.ts dealOfTheDay).
-->
<template>
  <section :aria-label="t('besti.ui.dealOfTheDay', 'Deal of the Day')" class="b-dotd">
    <div class="b-dotd__badge">
      <small>{{ t("besti.ui.dealOfTheDay", "Deal of the Day") }}</small>
      <b v-if="off > 0">{{ t("besti.percentOff", "{n}% off", { n: off }) }}</b>
      <besti-deal-clock :end="dealEndsAt" mode="blocks" />
    </div>
    <router-link :to="productTo" class="b-dotd__img">
      <img :alt="product.title" :src="picture" :srcset="srcset" sizes="(max-width: 900px) 40vw, 320px" @error="dropSrcset" />
    </router-link>
    <div class="b-dotd__info">
      <span v-if="product.brand" class="b-brand">{{ product.brand }}</span>
      <router-link :to="productTo" class="b-dotd__t">{{ product.title }}</router-link>
      <div v-if="colours.length" :aria-label="t('besti.card.colourOf', 'Colour of {name}', { name: product.title })" class="b-swrow -big" role="radiogroup">
        <button
          v-for="(v, i) in colours.slice(0, 6)"
          :key="i"
          :aria-checked="i === pick ? 'true' : 'false'"
          :aria-label="colourName(v.color)"
          :class="{ '-on': i === pick, '-out': v.quantity === 0 }"
          :style="{ '--sw': swatchBg(v.color) }"
          :title="colourName(v.color)"
          class="b-sw"
          role="radio"
          type="button"
          @click="pick = i"
        ></button>
      </div>
      <div v-else-if="chips.length" class="b-caps"><span v-for="c in chips.slice(0, 4)" :key="c">{{ c }}</span></div>
      <div class="b-price -lg">
        <u-price :amount="money.now" :currency="currency" class="b-price__now" />
        <span v-if="money.save > 0" class="b-save">{{ t("besti.card.save", "Save {amount}", { amount: moneyWhole(money.save) }) }}</span>
      </div>
      <div class="b-was"><template v-if="money.was">{{ t("besti.ui.was", "Was") }} <s><u-price :amount="money.was" :currency="currency" /></s></template></div>
      <div class="b-dotd__buy">
        <div v-if="shown > 0" :class="{ '-busy': busy }" :aria-label="t('besti.ui.quantityInCart', 'Quantity in cart')" class="b-step" role="group">
          <button :aria-label="shown > 1 ? t('besti.ui.oneFewer', 'One fewer') : t('besti.ui.removeFromCart', 'Remove from cart')" type="button" @click="step(-1)"><span class="ms">{{ shown > 1 ? "remove" : "delete" }}</span></button>
          <output aria-live="polite"><b>{{ shown }}</b><small> {{ t("besti.ui.inCart", "in cart") }}</small></output>
          <button :aria-label="t('besti.ui.oneMore', 'One more')" type="button" @click="step(1)"><span class="ms">add</span></button>
        </div>
        <button v-else-if="soldOut" class="b-btn -off" disabled type="button">{{ t("besti.ui.outOfStock", "Out of stock") }}</button>
        <button v-else-if="choose" class="b-btn" type="button" @click="$emit('quick-buy', product)"><span class="ms">tune</span>{{ chooseLabel(dimension) }}</button>
        <button v-else class="b-btn" type="button" @click="add"><span class="ms">add_shopping_cart</span>{{ t("besti.ui.addToCart", "Add to cart") }}</button>
        <button :aria-pressed="comparing ? 'true' : 'false'" :class="{ '-on': comparing }" class="b-link" type="button" @click="toggleCompare">
          <span class="ms">{{ comparing ? "check_box" : "compare_arrows" }}</span>{{ comparing ? t("besti.ui.comparing", "Comparing") : t("besti.ui.compare", "Compare") }}
        </button>
      </div>
    </div>
    <div v-if="more.length" class="b-dotd__more">
      <h3>{{ t("besti.ui.moreTopDeals", "More top deals") }}</h3>
      <router-link v-for="p in more" :key="p.id" :to="{ name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p.id } }" class="b-mini">
        <span class="b-mini__ph"><img :src="thumb(p)" alt="" loading="lazy" /></span>
        <span><b>{{ p.title }}</b><em><u-price :amount="nowOf(p).now" :currency="currency" /><s v-if="nowOf(p).was"><u-price :amount="nowOf(p).was" :currency="currency" /></s></em></span>
      </router-link>
    </div>
  </section>
</template>

<script>
import BuyMixin from "./besti-buy";
import { dropSrcset, productSrcset } from "../kalio/kalio-catalog";
import BestiDealClock from "./BestiDealClock.vue";
import { moneyOf } from "./besti";

export default {
  name: "BestiDealOfDay",
  components: { BestiDealClock },
  mixins: [BuyMixin],
  props: {
    product: { type: Object, required: true },
    more: { type: Array, default: () => [] },
  },
  computed: {
    picture() {
      return this.pictureIcon ? window.CDN.GET_SHOP_IMAGE_PATH(this.pictureIcon, null) : null;
    },
    srcset() {
      return productSrcset(this.product, this.variant?.image || null);
    },
  },
  methods: {
    dropSrcset,
    thumb(p) {
      return window.CDN.GET_SHOP_IMAGE_PATH(p.icon, 128);
    },
    nowOf(p) {
      return moneyOf(this.shop, p, null, this.currency);
    },
  },
};
</script>
