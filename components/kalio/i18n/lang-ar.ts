/* Besti in Arabic: the shared Kalio base and Besti's own words, one chunk. */
import base from "./base/ar";
import changed from "./besti-base.ar";
import own from "./besti.ar";

export default { ...base, ...changed, ...own } as Record<string, string>;
