/*
 * Besti's words, per language: the shared Kalio base (base/<lang>.ts, a copy of
 * new-shop-kits/i18n/kalio-base), the base keys whose English Besti changed (besti-base.<lang>.ts)
 * and Besti's own (besti.<lang>.ts). English is bundled; every other language is its own small
 * chunk, fetched only when a visitor picks it. Digini's languages: ar, hi, da. A language the
 * owner enables later: copy base/<code>.ts, write besti-base.<code>.ts and besti.<code>.ts, add
 * lang-<code>.ts and one line below.
 */
import baseEn from "./base/en";
import bestiEn from "./besti.en";

export const EN: Record<string, string> = { ...baseEn, ...bestiEn };

export const LOADERS: Record<string, () => Promise<any>> = {
  ar: () => import("./lang-ar"),
  hi: () => import("./lang-hi"),
  da: () => import("./lang-da"),
};
