# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Build for production
npm run generate   # Static site generation
npm run preview    # Preview production build
npm run reset      # Full reset: removes .nuxt, node_modules, .output, then reinstalls
```

No test runner is configured in this project.

## Starting a New Project from This Starter

Update these four values in `nuxt.config.ts`:

```ts
const title = "My App";
const description = "My app description";
const url = "https://example.com";
const image = `${url}/og-image.png`;
```

Also update the PWA `theme_color` in `nuxt.config.ts` and the primary color in `utils/themes.ts` to match your brand.

## Architecture

This is a Nuxt 4 + Vuetify 4 starter template. Vuetify is loaded via `vite-plugin-vuetify` (not a Nuxt module) and configured as a Nuxt plugin.

**Vuetify integration flow:**
1. `nuxt.config.ts` registers `vite-plugin-vuetify` via the `vite:extendConfig` hook and transpiles `vuetify`
2. `plugins/vuetify.ts` creates the Vuetify instance with SSR enabled and registers it with `app.vueApp.use(vuetify)`
3. The plugin uses auto-imported exports from `utils/` — `defaults`, themes, and icons are all consumed there without explicit imports

**`utils/` — Vuetify configuration:**
- `themes.ts` — defines `light` and `dark` `ThemeDefinition` objects using Tailwind color values from `tw-colors.ts`; exports `LIGHT_THEME` / `DARK_THEME` constants
- `defaults.ts` — global Vuetify component defaults (`VBtn` is flat, `rounded: "lg"`, height 38; `VTextField` is outlined)
- `customIcons.ts` — replaces Vuetify's default icon set with `@iconify/vue`'s `<Icon>` using Fluent icons (`fluent:*`); exports `aliases` and `custom`
- `tw-colors.ts` — full Tailwind color palette used as a shared color source for themes

**Icons:** Use `fluent:icon-name` strings directly as the `icon` prop value or in `prepend-inner-icon`. All Iconify icon sets work (not just Fluent) — the `custom` icon set renders via `@iconify/vue`'s `Icon` component which resolves any Iconify icon name.

**Composables:** `composables/rules.ts` exports `useFormRules()` with `ruleRequired`, `ruleEmail`, and `rulePassLen` for Vuetify form validation.

**Layout:** `layouts/default.vue` wraps content in `<VApp><VMain><slot /></VMain></VApp>`. `app.vue` is `<NuxtLayout><NuxtPage /></NuxtLayout>`.

**Styling:** Global styles in `assets/main.scss`, imported via `nuxt.config.ts`. Contains Inter font setup, Vuetify overrides (text field border radius, button font weight), `.label` class for form labels, and `.gradient` utility classes (`primary`, `success`, `info`, `warn`, `error`, `gray`, `cancel`).

**PWA:** Configured via `@kevinmarrec/nuxt-pwa` in `nuxt.config.ts`. Replace `public/favicon.ico` and `public/icon.png` for a new app.

**Firebase:** `plugins/firebase.ts` initializes Firebase and provides `$auth`, `$db`, `$storage` via `useNuxtApp()`. (`$storage` is initialized but unused — no photo feature planned.) Auth composable is `composables/useAuth.ts`. Admin routes protected by `middleware/auth.ts` (checks `role === 'admin'` in `users/{uid}`).

**Roles:** Two roles stored in Firestore `users/{uid}` — `admin` (full `/admin` access) and `guest` (only `/account`, `/request`, public pages). User doc fields: `role`, `email`, `name` (guest only), `phone` (guest only), `createdAt`.

**Auth state:** `useAuth()` exposes `user` (Firebase User), `userRole` (`'admin' | 'guest' | null`), `isLoggedIn`, `init`, `login`, `logout`. `init()` is called in `app.vue` on mount — sets up `onAuthStateChanged` listener which also fetches `userRole` from Firestore. After login, always fetch role from Firestore directly (don't wait for reactive state) to avoid timing issues. `pages/setup.vue` is dev-only (`import.meta.dev` guard).

**Invite system:** Registration is closed — only via one-time invite links (`/register/[token]`). Tokens are generated in `/admin/settings` using `composables/useInvite.ts` (`generateInvite(type)`, `validateToken`, `markTokenUsed`). `type: 'admin' | 'guest'` is stored in Firestore `invites` collection and returned by `validateToken`. Tokens expire in 7 days, marked `used: true` after registration. Admin invite → redirect `/admin`, guest invite → redirect `/apartment`.

**Bookings:** `composables/useBookings.ts` — `Booking` fields include `userId: string | null` (Firebase UID), `guestPhone: string`, `guestEmail: string`, `guestContact?: string` (legacy). Two Firestore collections: `bookings` (full data, admin-only) and `publicBookings` (stripped: `id, startDate, endDate, status` — no guest info). All writes use `writeBatch` to keep both collections in sync. `createBooking` / `updateBooking` / `deleteBooking` all update `publicBookings` atomically. `subscribePublic()` subscribes to `publicBookings` for the public `/request` conflict check. `syncPublicBookings()` rebuilds `publicBookings` from `bookings` (called once on first admin load). `formatDate(ts)` uses `ru-RU` locale. `statusColor` maps status to Vuetify color names.

**Landing page concept (`/`):** Public editorial page about the Prada / Monte Baldo / Lake Garda region — NOT apartment info. Five sections: Hero (region CTA), About (personal statement), Feature cards (6 topics: hiking, food, experiences, wellness, practical, family), Honest notes (region-focused: season, parking, cable car, wind, restaurants), Private CTA (`v-if="user"` only). Uses `$tm()` + `$rt()` for i18n arrays in Honest notes. No `useApartment()` here.

**Apartment page (`/apartment`):** Protected page for registered users (guests and admins). Shows apartment info from Firestore via `useApartment()`: title, description, address, directions, rules. Buttons: "Request dates" → `/request`, "My bookings" → `/account`. Auth guard uses `onAuthStateChanged` promise (same pattern as `/account`) — do NOT use `isLoggedIn.value` directly as it may be `false` before Firebase resolves.

**Guest route protection pattern:** Guest-facing protected pages (`/apartment`, `/account`, `/request`) use a client-side `onAuthStateChanged` promise in `onMounted` — NOT middleware. Pattern:
```ts
const user = await new Promise<any>((resolve) => {
  const unsub = onAuthStateChanged($auth, (u) => { unsub(); resolve(u); });
});
if (!user) { await navigateTo('/login'); return; }
```
Always show a loading spinner (`ref(true)` → `false` after data loads). Use local `ref<Booking[]>` (not shared `useState`) for guest bookings to avoid conflict with admin's global subscriber.

**Navigation:** `layouts/default.vue` `accountLink` computed: guest → `/apartment`, admin → `/admin`, unauthenticated → `/login`. Landing page private CTA also routes guests → `/apartment`, admins → `/admin`.

**Guest cabinet:** `pages/account/index.vue` — shows user profile from `users/{uid}`, own bookings (upcoming/past split), cancel pending, rejection note. Logout → navigates to `/`. Uses local `ref<Booking[]>` not shared state.

**Request form (`/request`):** For **anonymous users** — shows full 3-section form: Guest (name, email, phone), Dates, Details. For **logged-in users** — shows a compact read-only VCard with profile info (name, email, phone) instead of the Guest section, then only Dates + Details. In both cases form fields are pre-filled from `users/{uid}`. Real-time conflict check against `publicBookings`: blocking conflicts (confirmed/blocked) disable submit; pending conflicts show a warning but allow submit. Start date must not be in the past.

**Email notifications:** `composables/useNotifications.ts` — uses `@emailjs/browser` (lazy-loaded). `notifyAdminNewRequest(params)` → admin template when guest submits /request. `notifyGuestStatusUpdate(params)` → guest template when admin confirms/rejects. Both are best-effort (errors caught and logged, never block UI). Configure via env vars: `NUXT_PUBLIC_EMAILJS_PUBLIC_KEY`, `NUXT_PUBLIC_EMAILJS_SERVICE_ID`, `NUXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID`, `NUXT_PUBLIC_EMAILJS_GUEST_TEMPLATE_ID`. See `env.example` for template variable docs. If vars are not set, notifications are silently skipped.

**Mobile:** Admin layout uses `useDisplay()` from `'vuetify'` (import explicitly — not auto-imported). `layouts/admin.vue` uses `temporary` drawer + `VAppBar` with hamburger on mobile, permanent drawer with rail toggle on desktop. Pages with `VTable` (`/admin/bookings`, `/admin/guests`) render card lists on mobile using `v-if="!mobile"` / `v-else`. `AppCalendar.vue` has responsive CSS for cells < 600px.

**Calendar:** `components/AppCalendar.vue` — shared month-grid component. Props: `bookings: Booking[]`, `showNames: boolean`, `highlightIds?: string[]` (own bookings get primary border). Emits `select(booking)` when `showNames=true` and user clicks a booked cell. Handles month navigation, Mon-Sun headers via Intl, day coloring by status (pending=amber, confirmed=blue, blocked=red). Used in `/calendar` (public, no names) and `/admin/calendar` (with names + click → VDialog for confirm/delete).

**Admin bookings form:** `/admin/bookings/index.vue` — has a registered user selector (`getDocs` from `users` collection with `role='guest'`). When a registered user is selected, auto-fills `guestName/Phone/Email` from their profile and sets `userId` so the booking appears in their account. Also has a guest book selector (`guestId` from `/guests`). `canSave` computed guards the save button. `syncPublicBookings` is called once on first bookings load. `dialogConflicts` shows overlapping bookings in the form.

**i18n:** Locale files at `i18n/locales/{ru,en,de}.json`. Always add keys to all three files. Use `$t('key')` in templates, `useI18n().t('key')` in `<script setup>`. Use `$tm('key')` for arrays + `$rt(item)` per item. Import types from Vuetify with `import type` to avoid runtime errors.

**Environment variables:** See `env.example` at project root for all required variables. Firebase vars map via Nuxt's convention: `NUXT_PUBLIC_FIREBASE_API_KEY` → `runtimeConfig.public.firebaseApiKey`. EmailJS vars follow the same pattern.

**Always update PLAN.md and CLAUDE.md** after implementing significant features.

## Codex will review your output once you are done.