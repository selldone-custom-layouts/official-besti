<!--
  Besti — a product card (Home B "Department store", approved 8 November 2026).

  A bordered white tile: the photo on white with a small yellow "% off" flag,
  the colour swatches (a tap picks that colour: its photo, price and stock)
  or the capacity chips, a two-line name, the price with a red "Save $X",
  "Was $Y", the deal's own countdown ("Ends in 364d 23:15:07", only when
  the deal has an end date), a blue "Add to cart" that turns into "− n +" in place, and
  Compare and Save at the foot. A product whose choice is not a colour
  (capacity, size, pack) says "Choose capacity" and opens the quick-buy
  sheet, which has its own X. Nothing pops up. (besti-buy.ts)

  `inside`: drawn inside Selldone's own card (the catalogue grid), which is
  itself the link to the product, so this card has no links of its own then.
-->
<template>
  <article :class="{ '-inside': inside, '-big': big }" class="b-card">
    <component :is="inside ? 'div' : 'router-link'" :to="inside ? undefined : productTo" class="b-card__img" tabindex="-1">
      <img
        v-if="pictureIcon"
        :alt="product.title"
        :sizes="big ? '(max-width: 900px) 90vw, 440px' : '(max-width: 600px) 46vw, (max-width: 1280px) 22vw, 250px'"
        :src="picture"
        :srcset="srcset"
        loading="lazy"
        @error="dropSrcset"
      />
      <span v-if="off > 0" class="b-flag">{{ t("besti.percentOff", "{n}% off", { n: off }) }}</span>
      <span v-if="rank" class="b-rank">{{ rank }}</span>
    </component>

    <div class="b-card__body">
      <span v-if="big && product.brand" class="b-brand">{{ product.brand }}</span>

      <div v-if="colours.length" :aria-label="t('besti.card.colourOf', 'Colour of {name}', { name: product.title })" class="b-swrow" role="radiogroup">
        <button
          v-for="(v, i) in colours.slice(0, maxSwatches)"
          :key="i"
          :aria-checked="i === pick ? 'true' : 'false'"
          :aria-label="colourName(v.color)"
          :class="{ '-on': i === pick, '-out': v.quantity === 0 }"
          :style="{ '--sw': swatchBg(v.color) }"
          :title="colourName(v.color)"
          class="b-sw"
          role="radio"
          type="button"
          @click.prevent.stop="pick = i"
        ></button>
        <em v-if="colours.length > maxSwatches">+{{ colours.length - maxSwatches }}</em>
      </div>
      <div v-else-if="chips.length" class="b-caps">
        <span v-for="c in chips.slice(0, 3)" :key="c">{{ c }}</span>
        <em v-if="chips.length > 3">+{{ chips.length - 3 }}</em>
      </div>
      <div v-else class="b-swrow -none"></div>

      <component :is="inside ? 'span' : 'router-link'" :to="inside ? undefined : productTo" class="b-card__t">{{ product.title }}</component>

      <div v-if="product.rate_count && product.rate" class="b-card__rate">
        <span :style="{ '--k-rate': product.rate }" class="k-stars"></span><small>({{ product.rate_count }})</small>
      </div>

      <div class="b-price">
        <u-price :amount="money.now" :currency="currency" class="b-price__now" />
        <span v-if="money.save > 0" class="b-save">{{ t("besti.card.save", "Save {amount}", { amount: moneyWhole(money.save) }) }}</span>
      </div>
      <div class="b-was">
        <template v-if="money.was">{{ t("besti.ui.was", "Was") }} <s><u-price :amount="money.was" :currency="currency" /></s></template>
      </div>
      <!-- The deal's clock; its line is kept on every card so a row stays level. -->
      <div class="b-card__cd"><besti-deal-clock :end="dealEndsAt" mode="line" /></div>

      <div class="b-card__buy" @click.prevent.stop>
        <div v-if="shown > 0" :class="{ '-busy': busy }" :aria-label="t('besti.ui.quantityInCart', 'Quantity in cart')" class="b-step" role="group">
          <button :aria-label="shown > 1 ? t('besti.ui.oneFewer', 'One fewer') : t('besti.ui.removeFromCart', 'Remove from cart')" type="button" @click.prevent.stop="step(-1)">
            <span class="ms">{{ shown > 1 ? "remove" : "delete" }}</span>
          </button>
          <output aria-live="polite"><b>{{ shown }}</b><small> {{ t("besti.ui.inCart", "in cart") }}</small></output>
          <button :aria-label="t('besti.ui.oneMore', 'One more')" type="button" @click.prevent.stop="step(1)"><span class="ms">add</span></button>
        </div>
        <button v-else-if="soldOut" class="b-btn -block -off" disabled type="button">{{ t("besti.ui.outOfStock", "Out of stock") }}</button>
        <button v-else-if="choose" class="b-btn -block" type="button" @click.prevent.stop="$emit('quick-buy', product)">
          <span class="ms">tune</span><span class="b-long">{{ chooseLabel(dimension) }}</span><span class="b-short">{{ t("besti.ui.choose", "Choose") }}</span>
        </button>
        <button v-else class="b-btn -block" type="button" @click.prevent.stop="add">
          <span class="ms">add_shopping_cart</span><span class="b-long">{{ t("besti.ui.addToCart", "Add to cart") }}</span><span class="b-short">{{ t("besti.ui.add", "Add") }}</span>
        </button>
      </div>

      <div class="b-card__foot" @click.prevent.stop>
        <button :aria-pressed="comparing ? 'true' : 'false'" :class="{ '-on': comparing }" class="b-cmp" type="button" @click.prevent.stop="toggleCompare">
          <i><span class="ms">check</span></i>{{ t("besti.ui.compare", "Compare") }}
        </button>
        <button :aria-pressed="isSaved ? 'true' : 'false'" :class="{ '-on': isSaved }" class="b-heart" type="button" @click.prevent.stop="toggleSave">
          <span :class="{ fill: isSaved }" class="ms">favorite</span>{{ isSaved ? t("besti.ui.saved", "Saved") : t("besti.ui.save", "Save") }}
        </button>
      </div>
    </div>
  </article>
</template>

<script>
import BuyMixin from "./besti-buy";
import BestiDealClock from "./BestiDealClock.vue";
import { dropSrcset, productSrcset } from "../kalio/kalio-catalog";

export default {
  name: "BestiCard",
  components: { BestiDealClock },
  mixins: [BuyMixin],

  props: {
    product: { type: Object, required: true },
    /** Inside Selldone's card (the catalogue): no links of its own. */
    inside: Boolean,
    /** The big card of the Best sellers bento. */
    big: Boolean,
    /** A small dark label on the photo ("Best seller"). */
    rank: { type: String, default: null },
  },

  computed: {
    maxSwatches() {
      return this.big ? 6 : 4;
    },
    picture() {
      return this.pictureIcon ? window.CDN.GET_SHOP_IMAGE_PATH(this.pictureIcon, null) : null;
    },
    srcset() {
      return productSrcset(this.product, this.variant?.image || null);
    },
  },

  methods: { dropSrcset },
};
</script>
