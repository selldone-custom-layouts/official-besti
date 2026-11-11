/* Besti in Hindi: the shared Kalio base and Besti's own words, one chunk. Besti says "cart"
   (कार्ट) where the base says "basket" (बास्केट); both are feminine, so the swap keeps every sentence right. */
import base from "./base/hi";
import changed from "./besti-base.hi";
import own from "./besti.hi";

const cart: Record<string, string> = {};
for (const [k, v] of Object.entries(base as Record<string, string>)) cart[k] = v.replace(/बास्केट/g, "कार्ट");

export default { ...cart, ...changed, ...own } as Record<string, string>;
