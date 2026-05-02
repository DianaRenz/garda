import { describe, it, expect, beforeEach, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import CookieNotice from "~/components/CookieNotice.vue";

const STORAGE_KEY = "garda.cookieNoticeAcked";

describe("CookieNotice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("is visible on first mount when no acknowledgement is stored", async () => {
    const wrapper = await mountSuspended(CookieNotice);
    await wrapper.vm.$nextTick();
    const text = wrapper.text();
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toContain("cookies.notice"); // i18n key resolved
  });

  it("is hidden when localStorage already marks it acknowledged", async () => {
    localStorage.setItem(STORAGE_KEY, "1");
    const wrapper = await mountSuspended(CookieNotice);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toBe("");
  });

  it("links to /datenschutz for the 'learn more' anchor", async () => {
    const wrapper = await mountSuspended(CookieNotice);
    await wrapper.vm.$nextTick();
    const link = wrapper.find('a[href="/datenschutz"]');
    expect(link.exists()).toBe(true);
  });

  it("hides itself and persists acknowledgement when the button is clicked", async () => {
    const wrapper = await mountSuspended(CookieNotice);
    await wrapper.vm.$nextTick();
    const button = wrapper.find("button");
    expect(button.exists()).toBe(true);
    await button.trigger("click");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("1");
    // Banner contents removed after acknowledgement
    expect(wrapper.text()).toBe("");
  });

  it("does not crash when localStorage is unavailable", async () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });
    const wrapper = await mountSuspended(CookieNotice);
    await wrapper.vm.$nextTick();
    const button = wrapper.find("button");
    await button.trigger("click");
    // Banner still hides (visible flag flipped) even though persist failed
    expect(wrapper.text()).toBe("");
    setItem.mockRestore();
  });
});
