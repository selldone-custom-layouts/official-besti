/*
 * Kalio — the sample texts of the shop's own pages (5 November 2026).
 *
 * About us, Terms of use and Privacy come from the shop's profiles in the
 * Selldone dashboard. molino has written none of them yet, and the owner
 * asked for full pages in the meantime, filled with general text that says
 * it is a test and not real. These are those texts; each page shows them,
 * under KalioSampleNote, only while the shop's own profile is missing.
 *
 * Nothing here is a promise: the terms do not form an agreement and the
 * policy is not the shop's policy. Dates, numbers and names in the letter
 * are marked as examples.
 *
 * Each sentence or paragraph is its own key, in the visitor's language; the
 * pages call these functions at render time, so a language change follows.
 */

import { t } from "../i18n/kalio-i18n";

export interface Section {
  title: string;
  text: string[];
}

export function termsSample(shop: string): { short: string[]; sections: Section[] } {
  return {
    short: [
      t("besti.sample.terms.short.seller", "{shop} sells every product on this site itself.", { shop }),
      t("besti.sample.terms.short.pay", "You pay at checkout, or on delivery where it is offered."),
      t("besti.sample.terms.short.report", "Report a damaged or wrong item within 14 days."),
      t("besti.sample.terms.short.thread", "Each order has a message thread with our team."),
    ],
    sections: [
      {
        title: t("sample.terms.who.title", "Who we are"),
        text: [
          t("besti.sample.terms.who.p1", "{shop} is an online electronics store. We sell, pack and send every product on this site ourselves.", { shop }),
        ],
      },
      {
        title: t("sample.terms.account.title", "Your account"),
        text: [
          t("sample.terms.account.p1", "You need an account, or a guest checkout where the shop offers one, to order. Keep your sign-in details to yourself and tell us if you think someone else has used them."),
          t("sample.terms.account.p2", "Sample paragraph: a fuller explanation would go here, written in plain words, with examples of what this means for an order."),
        ],
      },
      {
        title: t("sample.terms.orders.title", "Orders and prices"),
        text: [
          t("besti.sample.terms.orders.p1", "Prices are shown with taxes as stated at checkout. An order is placed when you confirm it, and accepted when we confirm it."),
        ],
      },
      {
        title: t("sample.terms.payment.title", "Payment"),
        text: [
          t("besti.sample.terms.payment.p1", "You pay at checkout, or on delivery where cash on delivery is offered. Card payments are handled by the payment provider and are not stored by {shop}.", { shop }),
        ],
      },
      {
        title: t("sample.terms.delivery.title", "Delivery"),
        text: [
          t("besti.sample.terms.delivery.p1", "Delivery times and costs are shown before you pay. You can follow the order and message us from your account."),
        ],
      },
      {
        title: t("sample.terms.returns.title", "Returns and refunds"),
        text: [
          t("besti.sample.terms.returns.p1", "If something arrives damaged or wrong, tell us from the order page within 14 days. Opened software and personal-care items can be refunded but not returned."),
        ],
      },
      {
        title: t("sample.terms.changes.title", "Changes to these terms"),
        text: [t("sample.terms.changes.p1", "We may update these terms. The date at the top shows the latest version.")],
      },
    ],
  };
}

export function privacySample(shop: string): { short: string[]; sections: Section[] } {
  return {
    short: [
      t("sample.privacy.short.use", "We use your details to take and deliver orders."),
      t("besti.sample.privacy.short.couriers", "Couriers see only what they need to deliver it."),
      t("sample.privacy.short.sell", "We do not sell your data."),
      t("sample.privacy.short.cookies", "You choose which optional cookies to allow."),
    ],
    sections: [
      {
        title: t("sample.privacy.collect.title", "What we collect"),
        text: [
          t("sample.privacy.collect.p1", "Your name, contact details and delivery address; what you order; and how you use the shop (pages viewed, searches)."),
        ],
      },
      {
        title: t("sample.privacy.why.title", "Why we use it"),
        text: [
          t("besti.sample.privacy.why.p1", "To take and deliver your orders, to answer your messages about an order, to keep the shop secure and to improve it."),
          t("sample.privacy.why.p2", "Sample paragraph: a fuller explanation would go here, written in plain words, with an example for each use."),
        ],
      },
      {
        title: t("sample.privacy.who.title", "Who sees it"),
        text: [
          t("besti.sample.privacy.who.p1", "The courier who delivers your order sees what they need to bring it. Payment providers handle card details. We do not sell your data."),
        ],
      },
      {
        title: t("sample.privacy.keep.title", "How long we keep it"),
        text: [t("sample.privacy.keep.p1", "Order records for as long as the law requires; your account until you close it.")],
      },
      {
        title: t("sample.privacy.rights.title", "Your rights"),
        text: [t("sample.privacy.rights.p1", "You can see, correct, download or delete your data, and say no to marketing at any time.")],
      },
      {
        title: t("sample.privacy.cookies.title", "Cookies"),
        text: [
          t("besti.sample.privacy.cookies.p1", "Essential cookies keep you signed in and your cart full. Anything optional is your choice, below."),
        ],
      },
    ],
  };
}

export function aboutSample(shop: string) {
  return {
    title: t("besti.sample.about.title", "Tech, made simple to buy"),
    lead: t("besti.sample.about.lead", "Buying electronics should be easy: clear specs, honest prices and someone to ask. We keep the things we would recommend to a friend in one store, with one cart and one checkout."),
    text: [
      t("besti.sample.about.p1", "{shop} picks every product it sells, lists its specifications in full and keeps prices plain, with the saving marked when there is one. We pack and send every order ourselves, and answer every message from the order page.", { shop }),
    ],
    values: [
      {
        title: t("sample.about.values.prices.title", "Clear prices"),
        text: t("besti.sample.about.values.prices.text", "The price you see is the one you pay, with the saving and the old price marked plainly."),
      },
      {
        title: t("besti.sample.about.values.specs.title", "Specs you can compare"),
        text: t("besti.sample.about.values.specs.text", "Every product lists its specifications, and Compare puts them side by side."),
      },
      {
        title: t("besti.sample.about.values.packed.title", "Packed with care"),
        text: t("besti.sample.about.values.packed.text", "We pack each order ourselves and tell you where it is on the way."),
      },
      {
        title: t("sample.about.values.people.title", "People you can reach"),
        text: t("besti.sample.about.values.people.text", "Every order has a message thread with our team."),
      },
    ],
    timeline: [
      {
        when: t("sample.about.timeline.spring.when", "Spring"),
        text: t("besti.sample.about.timeline.spring.text", "The first departments open. (Example.)"),
      },
      {
        when: t("sample.about.timeline.summer.when", "Summer"),
        text: t("besti.sample.about.timeline.summer.text", "Same-day delivery starts in town. (Example.)"),
      },
      {
        when: t("sample.about.timeline.today.when", "Today"),
        text: t("besti.sample.about.timeline.today.text", "Every department, one checkout. (Example.)"),
      },
    ],
    sign: t("sample.about.sign", "— the {shop} team", { shop }),
  };
}

/** A shop page's text with its markup taken out, for "is it empty?". */
export function plainText(html: string | null | undefined): string {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
