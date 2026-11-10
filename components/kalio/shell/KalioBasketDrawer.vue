<!--
  Kalio — the basket drawer (the header's Basket).

  A receipt first: the subtotal large, what the shopper saves, and
  Checkout right there. Then the basket in compact rows (picture, name,
  size and seller, a quantity stepper, the line's price), and under it
  three products often added, each with its own "+" (KalioOftenAdded). Design C of three
  drawn on 4 November 2026 (../kalio-design/basket-drawer-options/).

  It replaces Selldone's BasketTopMenu ("YOUR CART", a black "Count"
  dropdown, "Hour" and a black Checkout). The basket, its bill and the
  steppers are the storefront's own (getBaskets, kalio-basket.ts); the
  stepper changes the count as it is tapped and the bill follows. A
  basket of another type (a file or a service) gets its own receipt.
-->
<template>
  <div class="k-bdrawer">
    <section v-for="group in groups" :key="group.type" class="k-bdrawer__group">
      <div :class="{ '-settling': group.settling }" class="k-bdrawer__receipt">
        <div class="k-bdrawer__sum">
          <p class="k-bdrawer__total">
            <small>
              Subtotal · {{ group.units }} {{ group.units === 1 ? "item" : "items" }}
              <template v-if="groups.length > 1"> · {{ typeName(group.type) }}</template>
            </small>
            <span class="u--price">{{ money(group.total, group.currency) }}</span>
          </p>
          <span v-if="group.saved >= 0.01" class="k-bdrawer__save">
            You save <span class="u--price">{{ money(group.saved, group.currency) }}</span>
          </span>
        </div>
        <router-link :to="checkoutRoute(group.type)" class="k-bdrawer__go" @click="$emit('close')">
          <v-icon size="20">shopping_bag</v-icon>
          Checkout
        </router-link>
      </div>

      <ul class="k-bdrawer__rows">
        <li v-for="item in group.items" :key="item.id" class="k-bdrawer__row">
          <router-link :to="productRoute(item.product_id)" class="k-bdrawer__pic" @click="$emit('close')">
            <img v-if="image(item.product)" :src="image(item.product)" alt="" height="36" loading="lazy" width="36" />
          </router-link>
          <router-link :to="productRoute(item.product_id)" class="k-bdrawer__name" @click="$emit('close')">
            <span>{{ item.product?.title }}</span>
            <small v-if="meta(item)">{{ meta(item) }}</small>
          </router-link>
          <div
            :aria-label="`Quantity of ${item.product?.title || 'this item'}`"
            :class="{ '-busy': settling(item.product, item) }"
            class="k-bdrawer__qty"
            role="group"
          >
            <button :aria-label="shown(item) > 1 ? 'One fewer' : 'Remove from cart'" type="button" @click="step(item, -1)">
              <v-icon size="16">{{ shown(item) > 1 ? "remove" : "delete_outline" }}</v-icon>
            </button>
            <output aria-live="polite">{{ shown(item) }}</output>
            <button :disabled="shown(item) >= max(item)" aria-label="One more" type="button" @click="step(item, 1)">
              <v-icon size="16">add</v-icon>
            </button>
          </div>
          <span class="u--price k-bdrawer__price">{{ money(item.price * shown(item), item.currency || group.currency) }}</span>
        </li>
      </ul>
    </section>

    <kalio-often-added :count="3" class="k-bdrawer__often" @navigate="$emit('close')" />
  </div>
</template>

<script>
import { money as regionMoney } from "../../region-switcher/region";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { settling, shownCount, stepTo } from "../kalio-basket";
import { productImage } from "../kalio-catalog";
import { colourName } from "../../besti/besti";
import KalioOftenAdded from "../KalioOftenAdded.vue";

/* The size of a variant in words: its volume, weight, pack, colour or style. */
function sizeOf(variant) {
  if (!variant) return null;
  return variant.volume || variant.weight || variant.pack || variant.type || variant.style || null;
}

export default {
  name: "KalioBasketDrawer",
  components: { KalioOftenAdded },

  emits: ["close"],

  computed: {
    /* One receipt per basket with something in it: usually the one basket
       of groceries. Rows taken to zero leave at once; the bill follows. */
    groups() {
      return this.getBaskets()
        .filter((basket) => basket?.items?.length)
        .map((basket) => {
          const bill = basket.bill || {};
          const items = basket.items.filter((item) => shownCount(item.product || { id: item.product_id }, item) > 0);
          return {
            type: basket.type,
            items,
            units: basket.items.reduce((sum, item) => sum + (item.count || 0), 0),
            total: typeof bill.price === "number" ? bill.price : basket.price,
            /* From the lines, not the bill: a basket read on page load
               comes without one. */
            saved: basket.items.reduce(
              (sum, item) => sum + (item.dis || 0) * (item.count || 0) + (item.offer_amount || 0),
              0,
            ),
            currency: bill.currency || basket.currency,
            settling: basket.items.some((item) => settling(item.product || { id: item.product_id }, item)),
          };
        })
        .filter((group) => group.items.length);
    },
  },

  methods: {
    /* An amount in the cart's own currency, shown in the visitor's: the
       server reprices the cart after a pick; this covers the moment before. */
    money(n, from) {
      return regionMoney(n, from);
    },
    settling,

    image(product) {
      return productImage(product, true);
    },

    /* Besti is one shop, not a marketplace: the line says its size or
       colour, never a seller. */
    meta(item) {
      return sizeOf(item.variant) || (item.variant?.color ? colourName(item.variant.color) : null);
    },

    typeName(type) {
      return this.$t(ProductType[type]?.name || type);
    },

    shown(item) {
      return shownCount(item.product || { id: item.product_id }, item);
    },

    max(item) {
      return item.vendor_product?.quantity ?? item.variant?.quantity ?? item.product?.quantity ?? 99;
    },

    step(item, delta) {
      const product = { id: item.product_id, type: item.product?.type };
      stepTo(this, product, item, this.shown(item) + delta);
    },

    productRoute(id) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: id } };
    },

    checkoutRoute(type) {
      return { name: window.$storefront.routes.BASKET_PAGE, params: { type } };
    },
  },
};
</script>
