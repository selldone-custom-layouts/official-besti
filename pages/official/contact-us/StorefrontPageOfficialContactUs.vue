<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  -->
<!--
  Besti — Contact us (digini-design/contact-b.html).

  A message form (name, email, order number, topic, message) sent with
  Selldone's own contact form call, and beside it how else to reach the
  shop. When the shop has written its "Contact us" page in the dashboard,
  that text is shown there; until then sample cards under a clear "Sample
  text" note (the owner's rule for a test shop), and always a card to track
  an order. A missing page is not an error: nothing red is shown.
-->
<template>
  <div class="b-contact">
    <h1 class="b-contact__h">{{ t("besti.ui.contactUs", "Contact us") }}</h1>
    <p class="b-contact__lede">{{ t("besti.ui.questionsAboutAProductOr", "Questions about a product or an order? Write to us and we'll get back to you.") }}</p>

    <div class="b-contact__cols">
      <section aria-labelledby="b-contact-form" class="b-contact__form">
        <template v-if="submitted">
          <div class="b-empty">
            <span class="b-empty__ic"><span class="ms">mark_email_read</span></span>
            <p id="b-contact-form" class="b-empty__t">{{ t("besti.ui.thanksYourMessageIsOn", "Thanks, your message is on its way") }}</p>
            <p class="b-empty__p">{{ t("besti.ui.weUsuallyAnswerWithinA", "We usually answer within a working day, at the email you gave us.") }}</p>
            <button class="b-btn -line" type="button" @click="submitted = false">{{ t("besti.ui.sendAnotherMessage", "Send another message") }}</button>
          </div>
        </template>
        <form v-else novalidate @submit.prevent="sendForm">
          <h2 id="b-contact-form">{{ t("besti.ui.sendUsAMessage", "Send us a message") }}</h2>
          <div class="b-form">
            <label class="b-field">
              <span>{{ t("besti.ui.name", "Name") }}</span>
              <input v-model.trim="name" autocomplete="name" :placeholder="t('besti.ui.yourName', 'Your name')" type="text" />
            </label>
            <label :class="{ '-bad': tried && !emailOk }" class="b-field">
              <span>{{ t("besti.ui.email", "Email") }}</span>
              <input v-model.trim="email" autocomplete="email" placeholder="you@example.com" type="email" />
              <small v-if="tried && !emailOk">{{ t("besti.ui.pleaseEnterYourEmailSo", "Please enter your email, so we can answer.") }}</small>
            </label>
            <label class="b-field">
              <span>{{ t("besti.ui.orderNumberOptional", "Order number (optional)") }}</span>
              <input v-model.trim="order" placeholder="e.g. 1042" type="text" />
            </label>
            <label class="b-field">
              <span>{{ t("besti.ui.topic", "Topic") }}</span>
              <select v-model="category">
                <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>
            <label :class="{ '-bad': tried && !message }" class="b-field -wide">
              <span>{{ t("besti.ui.message", "Message") }}</span>
              <textarea v-model="message" :placeholder="t('besti.ui.howCanWeHelp', 'How can we help?')" rows="5"></textarea>
              <small v-if="tried && !message">{{ t("besti.ui.pleaseWriteYourMessage", "Please write your message.") }}</small>
            </label>
          </div>
          <div class="b-contact__send">
            <button :disabled="busy_send" class="b-btn" type="submit">
              <span class="ms">send</span>{{ busy_send ? "Sending…" : "Send message" }}
            </button>
            <small>{{ t("besti.ui.weUsuallyAnswerWithinA2", "We usually answer within a working day.") }}</small>
          </div>
          <p v-if="error" class="b-contact__err" role="alert">{{ error }}</p>
        </form>
      </section>

      <aside :aria-label="t('besti.ui.otherWaysToReachUs', 'Other ways to reach us')" class="b-contact__side">
        <div v-if="profile && profileText" class="b-contact__card -profile">
          <s-article-editor :body="profile.body" :edit="false" :enable-title="false" :only-view="true" class="k-prose" />
        </div>
        <template v-else-if="!busy">
          <kalio-sample-note />
          <div v-for="c in samples" :key="c.title" class="b-contact__card">
            <span class="b-contact__ic"><span class="ms">{{ c.icon }}</span></span>
            <div>
              <b>{{ c.title }}</b>
              <p>{{ c.line }}</p>
              <span class="b-contact__more">{{ c.more }}</span>
            </div>
          </div>
        </template>
        <div class="b-contact__card">
          <span class="b-contact__ic"><span class="ms">local_shipping</span></span>
          <div>
            <b>{{ t("besti.ui.trackAnOrder", "Track an order") }}</b>
            <p>{{ t("besti.ui.yourOrdersTheirStatusAnd", "Your orders, their status and messages are in your account.") }}</p>
            <router-link :to="{ name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL }" class="b-link">{{ t("besti.ui.trackOrder", "Track order") }}<span class="ms b-flip">chevron_right</span></router-link>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import SArticleEditor from "@selldone/components-vue/article/SArticleEditor.vue";
import KalioSampleNote from "../../../components/kalio/pages/KalioSampleNote.vue";
import { plainText } from "../../../components/kalio/pages/kalio-sample-pages";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageOfficialContactUs",
  components: { SArticleEditor, KalioSampleNote },
  inject: ["$shop"],

  data: () => ({
    window,
    profile: null as any,
    busy: false,
    name: "",
    email: "",
    order: "",
    message: "",
    category: "A product question",
    topics: ["A product question", "An order I placed", "Delivery or pickup", "Returns and refunds", "Something else"],
    busy_send: false,
    submitted: false,
    tried: false,
    error: null as string | null,
  }),

  computed: {
    emailOk(): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email || "");
    },
    profileText(): string {
      return plainText(this.profile?.body);
    },
    samples() {
      return [
        { icon: "mail", title: "Email us", line: "hello@besti.example", more: "Answers within a working day" },
        { icon: "call", title: "Call us", line: "+1 305 555 0100", more: "Mon–Fri, 9 AM – 6 PM" },
        { icon: "location_on", title: "Visit", line: "100 Biscayne Blvd, Miami, FL 33132", more: "Pickup point" },
      ];
    },
  },

  created() {
    this.setPageTitle(t("besti.contactUs", "Contact us"));
    this.fetchProfile();
    const u = this.USER();
    if (u) {
      this.name = u.name || "";
      this.email = u.email || "";
    }
  },

  methods: {
    /* The shop's own "Contact us" page, if it wrote one. None is not an error. */
    fetchProfile() {
      this.busy = true;
      window.axios
        .get(window.XAPI.GET_SHOP_PROFILE(this.$shop.name, "contact-us"))
        .then(({ data }: any) => {
          this.profile = data?.error ? null : data.profile;
        })
        .catch(() => (this.profile = null))
        .finally(() => (this.busy = false));
    },
    sendForm() {
      this.tried = true;
      this.error = null;
      const text = String(this.message || "").replace(/<[^>]*>?/gm, "").trim();
      if (!text || !this.emailOk) return;
      this.busy_send = true;
      window.axios
        .post(window.XAPI.POST_CONTACT_US_FORM(this.$shop.name), {
          name: this.name,
          email: this.email,
          phone: this.USER()?.phone || null,
          message: this.order ? `Order ${this.order}\n\n${text}` : text,
          category: this.category,
          url: window.location.href,
        })
        .then(({ data }: any) => {
          if (data?.error) {
            this.error = data.error_msg || "That did not go through. Please try again.";
            return;
          }
          this.message = "";
          this.order = "";
          this.tried = false;
          this.submitted = true;
        })
        .catch(() => (this.error = "That did not go through. Please try again in a moment."))
        .finally(() => (this.busy_send = false));
    },
  },
};
</script>
