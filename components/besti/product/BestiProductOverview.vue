<!--
  Besti — the top of a product page, in three columns like a big
  electronics store (digini-design/product-b.html):

  1. the gallery, thumbnails beside the photo (under it on a phone);
  2. the brand, the name, the item number and the rating line, the colour
     or capacity as tiles each with its own photo (and its own price when
     it has one), and the key specs from the product's own spec;
  3. a sticky buy box: the price with a red "Save $X" and "Was", stock, how
     it reaches you (the shop's own delivery methods), Add to cart (which
     becomes "− n +" and Checkout once it is in the cart), Compare and Save.

  In the quick-buy sheet (quickBuyMode) only the photo and the buy box with
  the choice show. Every behaviour is Kalio's overview, which is Selldone's
  SProductOverview (extends): variants, stock, the cart, the sticky buy bar
  on a phone. A product whose variants differ in more than one way keeps
  Selldone's own variant picker.
-->
<template>
  <div :class="{ '-quick': quickBuyMode }" class="b-pdp">
    <!-- ▆▆▆▆ 1. Gallery ▆▆▆▆ -->
    <section v-if="showCover" :aria-label="t('besti.ui.productImages', 'Product images')" class="b-pdp__media">
      <!-- The thumbnails in one row under the picture, never a side column
           (it grew far longer than the picture with many photos). -->
      <s-shop-product-slide-show :current-variant="current_variant" :vertical="false" />
    </section>

    <!-- ▆▆▆▆ 2. What it is ▆▆▆▆ -->
    <section class="b-pdp__info">
      <router-link v-if="$product.brand" :to="brandTo" class="b-brand">{{ $product.brand }}</router-link>
      <h1 class="b-pdp__title">{{ $product.title }}</h1>
      <div class="b-pdp__meta">
        <span v-if="$product.sku">{{ t("besti.pdp.sku", "SKU {sku}", { sku: $product.sku }) }}</span>
        <span v-else>{{ t("besti.pdp.item", "Item {id}", { id: $product.id }) }}</span>
        <a v-if="$product.rate_count && $product.rate" class="b-pdp__rate" href="#b-reviews" @click.prevent="toReviews">
          <span :style="{ '--k-rate': $product.rate }" class="k-stars"></span>
          <b>{{ Number($product.rate).toFixed(1) }}</b>
          ({{ t("besti.pdp.reviewCount", { one: "{n} review", other: "{n} reviews" }, { n: $product.rate_count }) }})
        </a>
        <a v-else-if="!quickBuyMode" class="b-pdp__rate -none" href="#b-reviews" @click.prevent="toReviews">
          <span class="k-stars" style="--k-rate: 0"></span>{{ t("besti.ui.noReviewsYet", "No reviews yet") }}
        </a>
      </div>

      <p v-if="!has_original_warranty" class="b-pdp__warn">
        <span class="ms">error</span>{{ $t("product_info.fake") }}
      </p>

      <!-- The choice: tiles with their own photo (one dimension), else Selldone's picker -->
      <div v-if="tiles.length" class="b-pdp__choice">
        <p class="b-lbl">
          {{ dimWord }}: <b>{{ currentLabel }}</b>
        </p>
        <div :class="{ '-text': !tilesHavePhotos }" class="b-vtiles" role="radiogroup" :aria-label="dimWord">
          <button
            v-for="t in tiles"
            :key="t.v.id"
            :aria-checked="current_variant && current_variant.id === t.v.id ? 'true' : 'false'"
            :class="{ '-on': current_variant && current_variant.id === t.v.id, '-out': !(t.v.quantity > 0) }"
            class="b-vtile"
            role="radio"
            type="button"
            @click="current_variant = t.v"
          >
            <span v-if="tilesHavePhotos" class="b-vtile__ph"><img :src="t.img" alt="" loading="lazy" /></span>
            <span class="b-vtile__l">
              <i v-if="t.swatch" :style="{ background: t.swatch }" aria-hidden="true"></i>{{ t.label }}
            </span>
            <small v-if="t.price !== null"><u-price :amount="t.price" :currency="currency" /></small>
            <small v-if="!(t.v.quantity > 0)" class="-out">{{ t("besti.ui.outOfStock", "Out of stock") }}</small>
          </button>
        </div>
      </div>
      <div v-else-if="product_variants.length" class="b-pdp__choice -selldone">
        <s-product-section-variants
          v-model:current-variant="current_variant"
          v-model:filter="filter"
          v-model:selection-values="selection_values"
        ></s-product-section-variants>
      </div>

      <div class="b-pdp__more">
        <s-product-section-service v-model:preferences="preferences"></s-product-section-service>
        <s-product-section-valuation
          v-if="preferences && preferences.valuation"
          :correspondingBasketItem="corresponding_basket_item"
          :current-variant="current_variant"
          :preferences="preferences"
        ></s-product-section-valuation>
      </div>

      <div v-if="keySpecs.length && !quickBuyMode" class="b-pdp__specs">
        <h2>{{ t("besti.ui.keySpecs", "Key specs") }}</h2>
        <dl>
          <template v-for="row in keySpecs" :key="row.key">
            <dt>{{ row.key }}</dt>
            <dd>{{ row.value }}</dd>
          </template>
        </dl>
        <a class="b-link" href="#b-specs" @click.prevent="toSpecs">{{ t("besti.ui.allSpecifications", "All specifications") }}<span class="ms b-flip">chevron_right</span></a>
      </div>
    </section>

    <!-- ▆▆▆▆ 3. The buy box ▆▆▆▆ -->
    <aside class="b-pdp__buy">
      <div class="b-buybox">
        <div v-if="isSubscription" class="b-buybox__price">
          <s-subscription-price-select
            v-model="selected_subscription_price"
            :class="{ pen: !!corresponding_basket_item?.subscription_price_id || !!membership_subscribed_plan }"
            :disabled="!$product.quantity"
            :subscription-prices="subscription_prices"
            return-object
          ></s-subscription-price-select>
        </div>
        <template v-else>
          <div class="b-price -lg">
            <u-price :amount="money.now" :currency="currency" class="b-price__now" />
            <span v-if="money.save > 0" class="b-save">{{ t("besti.card.save", "Save {amount}", { amount: moneyWhole(money.save) }) }}</span>
          </div>
          <div class="b-was"><template v-if="money.was">{{ t("besti.ui.was", "Was") }} <s><u-price :amount="money.was" :currency="currency" /></s></template></div>
          <!-- The deal's own end (the chosen variant's when it has its own
               pricing), on Selldone's countdown; no end date, no clock. -->
          <div v-if="dealEndsAt" class="b-buybox__deal">
            <span class="b-buybox__dealt"><span class="ms">schedule</span>{{ t("besti.ui.dealEndsIn", "Deal ends in") }}</span>
            <u-count-down :end="dealEndsAt" />
          </div>
        </template>
        <s-product-section-tax></s-product-section-tax>

        <ul class="b-buybox__facts">
          <li :class="stock > 0 ? '-ok' : '-no'">
            <span class="ms">{{ stock > 0 ? "check_circle" : "cancel" }}</span>
            <template v-if="stock > 0 && stock <= 5">{{ t("besti.pdp.onlyLeft", "Only {n} left", { n: stock }) }}</template>
            <template v-else-if="stock > 0">{{ t("besti.ui.inStock", "In stock") }}</template>
            <template v-else>{{ t("besti.ui.outOfStock", "Out of stock") }}</template>
          </li>
          <template v-if="!quickBuyMode">
            <li v-for="w in ways" :key="w.key">
              <span class="ms">{{ w.icon === "storefront" ? "storefront" : "local_shipping" }}</span>
              <span>
                {{ w.word }}<template v-if="w.free"> · {{ t("besti.pdp.free", "Free") }}</template
                ><template v-else-if="w.freeOver"> · {{ t("shipping.freeOver", "Free over {amount}", { amount: rsMoney(w.freeOver, w.currency) }) }}</template>
              </span>
            </li>
            <li v-if="!ways.length"><span class="ms">local_shipping</span>{{ t("besti.ui.deliveryOptionsAtCheckout", "Delivery options at checkout") }}</li>
          </template>
        </ul>

        <s-product-section-extra-pricings
          :current-variant="current_variant"
          :preferences="preferences"
          :quantity="corresponding_basket_item?.count"
          :selected-vendor-product="selected_vendor_product"
          @select="(val) => $refs.buy_section?.triggerBuyButton(val.min)"
        ></s-product-section-extra-pricings>

        <kalio-basket-line
          v-if="canBuy && corresponding_basket_item"
          :line="corresponding_basket_item"
          :product="$product"
          :stock="current_variant ? current_variant.quantity : $product.quantity"
          class="b-buybox__line"
        />
        <s-product-section-buy-button
          v-else
          ref="buy_section"
          :can-buy="canBuy"
          :current-variant="current_variant"
          :hss-sticky-but-button="hssStickyButButton"
          :preferences="preferences"
          :quick-buy-mode="quickBuyMode"
          :selected-subscription-price="selected_subscription_price"
          :selected-vendor-product="selected_vendor_product"
          class="b-buybox__add"
        ></s-product-section-buy-button>

        <div class="b-buybox__acts">
          <button :aria-pressed="comparing ? 'true' : 'false'" :class="{ '-on': comparing }" class="b-btn -line" type="button" @click="toggleCompare">
            <span class="ms">{{ comparing ? "check_box" : "compare_arrows" }}</span>{{ comparing ? t("besti.ui.comparing", "Comparing") : t("besti.ui.compare", "Compare") }}
          </button>
          <button :aria-pressed="isSaved ? 'true' : 'false'" :class="{ '-on': isSaved }" class="b-btn -line" type="button" @click="toggleSave">
            <span :class="{ fill: isSaved }" class="ms">favorite</span>{{ isSaved ? t("besti.ui.saved", "Saved") : t("besti.ui.save", "Save") }}
          </button>
        </div>

        <s-product-section-incentivise :variant="current_variant" :vendorProduct="selected_vendor_product"></s-product-section-incentivise>
        <s-storefront-coupons-list :product-id="$product.id" :variant-id="current_variant ? current_variant.id : undefined"></s-storefront-coupons-list>

        <router-link v-if="quickBuyMode" :to="productTo" class="b-link b-buybox__full">{{ t("besti.ui.seeFullDetails", "See full details") }}<span class="ms b-flip">chevron_right</span></router-link>
      </div>
      <p v-if="!quickBuyMode" class="b-pdp__ask">
        <span class="ms">support_agent</span>{{ t("besti.ui.questionsAboutIt", "Questions about it?") }}
        <router-link :to="{ name: window.$storefront.routes.SHOP_CONTACT_US }">{{ t("besti.ui.contactUs", "Contact us") }}</router-link>
      </p>
    </aside>

    <basket-item-user-message-form
      v-if="basket"
      :basket="basket"
      :product="$product"
      :variant-id="current_variant ? current_variant.id : null"
      class="b-pdp__note"
    ></basket-item-user-message-form>
  </div>
</template>

<script>
import { money as regionMoney } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";
import { currentCurrency } from "../../region-switcher/region";
import KalioProductOverview from "../../kalio/product/KalioProductOverview.vue";
import UCountDown from "@selldone/components-vue/ui/count-down/UCountDown.vue";
import { waysOf } from "../../walio/walio-home";
import { brandRoute, colourName, dealEnd, moneyOf, moneyText, saved, swatchBg, toggleSaved, variantDimension } from "../besti";
import { specRows } from "./besti-spec";

export default {
  name: "BestiProductOverview",
  extends: KalioProductOverview,
  components: { UCountDown },

  data() {
    return { compact: false };
  },

  computed: {
    currency() {
      return currentCurrency();
    },
    productTo() {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: this.$product.id } };
    },
    brandTo() {
      return brandRoute(this.$product.brand);
    },
    ways() {
      return waysOf(this.shop || this.$shop).slice(0, 3);
    },
    enabledVariants() {
      return this.product_variants.filter((v) => v.enable !== false && v.enable !== 0);
    },
    dimension() {
      return variantDimension(this.enabledVariants);
    },
    dimWord() {
      switch (this.dimension?.key) {
        case "color":
          return t("besti.dim.colour", "Colour");
        case "volume":
          return t("besti.dim.capacity", "Capacity");
        case "weight":
          return t("besti.dim.weight", "Weight");
        case "pack":
          return t("besti.dim.pack", "Pack");
        case "type":
          return t("besti.dim.type", "Type");
        case "style":
          return t("besti.dim.style", "Style");
        default:
          return t("besti.dim.option", "Option");
      }
    },
    /* One dimension: a tile per variant with its own photo and price. */
    tiles() {
      const d = this.dimension;
      if (!d || d.key === "mixed") return [];
      return this.enabledVariants.map((v) => {
        const own = v.pricing && v.price != null;
        return {
          v,
          img: window.CDN.GET_SHOP_IMAGE_PATH(v.image || this.$product.icon, 128),
          swatch: d.key === "color" ? swatchBg(v.color) : null,
          label: d.key === "color" ? colourName(v.color) || t("besti.dim.colour", "Colour") : v[d.key],
          price: own ? moneyOf(this.shop, this.$product, v, this.currency).now : null,
        };
      });
    },
    tilesHavePhotos() {
      return this.dimension?.key === "color" || this.enabledVariants.some((v) => v.image);
    },
    currentLabel() {
      const t = this.tiles.find((x) => this.current_variant && x.v.id === this.current_variant.id);
      return t ? t.label : "";
    },
    money() {
      return moneyOf(this.shop, this.$product, this.current_variant, this.currency);
    },
    dealEndsAt() {
      return dealEnd(this.$product, this.current_variant);
    },
    stock() {
      if (this.current_variant) return this.current_variant.quantity || 0;
      return this.$product.quantity || 0;
    },
    keySpecs() {
      return specRows(this.$product).slice(0, 6);
    },
    comparing() {
      return (this.$store.getters.getProductsComparison || []).some((p) => p.id === this.$product.id);
    },
    isSaved() {
      return saved[this.$product.id] ?? !!this.$product.wishlist;
    },
  },

  mounted() {
    this.onResize();
    window.addEventListener("resize", this.onResize, { passive: true });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },

  methods: {
    /* An amount in its own currency, shown in the visitor's (region switcher). */
    rsMoney(n, from, short = "auto") {
      return regionMoney(n, from, { short });
    },
    onResize() {
      this.compact = window.innerWidth < 900;
    },
    moneyWhole(n) {
      return moneyText(n, this.currency, Math.round(n) === n);
    },
    toReviews() {
      document.getElementById("b-reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    toSpecs() {
      document.getElementById("b-specs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    toggleCompare() {
      if (this.comparing) this.removeFromProductComparison(this.$product, null);
      else this.addToProductComparison(this.$product, this.current_variant, true);
    },
    toggleSave() {
      toggleSaved(this, this.$product);
    },
  },
};
</script>
