/* Besti in Danish: the shared Kalio base and Besti's own words, one chunk. */
import base from "./base/da";
import changed from "./besti-base.da";
import own from "./besti.da";

export default { ...base, ...changed, ...own } as Record<string, string>;
