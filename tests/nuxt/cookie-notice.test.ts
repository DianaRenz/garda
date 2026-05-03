import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import CookieNotice from "~/components/CookieNotice.vue";

const STORAGE_KEY = "garda.cookieNoticeAcked";

// happy-dom's localStorage does not support .clear() in Nuxt test env,
// so we provide a minimal mock via vi.stubGlobal.
const store = new Map<string, string>();
const storageMock = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
  get length() { return store.size; },
  key: (_i: number) => null as string | null,
};

describe("CookieNotice", () => {
  beforeEach(() => {
    store.clear();
    vi.stubGlobal("localStorage", storageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is visible on first mount when no acknowledgement is stored", async () => {
    const wrapper = await mountSuspended(CookieNotice);
    await wrapper.vm.$nextTick();
    const text = wrapper.text();
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toContain("cookies.notice"); // i18n key resolved
  });

  it("is hidden when localStorage already marks it acknowledged", async () => {
    store.set(STORAGE_KEY, "1");
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
    expect(store.get(STORAGE_KEY)).toBe("1");
    // Banner contents removed after acknowledgement
    expect(wrapper.text()).toBe("");
  });

  it("does not crash when localStorage is unavailable", async () => {
    vi.stubGlobal("localStorage", {
      ...storageMock,
      setItem: () => { throw new Error("quota exceeded"); },
    });
    const wrapper = await mountSuspended(CookieNotice);
    await wrapper.vm.$nextTick();
    const button = wrapper.find("button");
    await button.trigger("click");
    // Banner still hides (visible flag flipped) even though persist failed
    expect(wrapper.text()).toBe("");
  });
});
