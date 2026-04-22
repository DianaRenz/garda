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

**Firebase:** `plugins/firebase.ts` initializes Firebase and provides `$auth`, `$db`, `$storage` via `useNuxtApp()`. Auth composable is `composables/useAuth.ts`. Admin routes protected by `middleware/auth.ts` (checks `role === 'admin'` in `users/{uid}`).

**Roles:** Two roles stored in Firestore `users/{uid}` — `admin` (full `/admin` access) and `guest` (only `/account`, `/request`, public pages). User doc fields: `role`, `email`, `name` (guest only), `phone` (guest only), `createdAt`.

**Invite system:** Registration is closed — only via one-time invite links (`/register/[token]`). Tokens are generated in `/admin/settings` using `composables/useInvite.ts` (`generateInvite(type)`, `validateToken`, `markTokenUsed`). `type: 'admin' | 'guest'` is stored in Firestore `invites` collection and returned by `validateToken`. Tokens expire in 7 days, marked `used: true` after registration. Admin invite → redirect `/admin`, guest invite → redirect `/account`.

**Bookings:** `composables/useBookings.ts` — `Booking` has `userId: string | null` (Firebase UID of registered guest who submitted the request). `subscribeByUser(uid)` queries bookings where `userId == uid` for the guest cabinet. `createBooking` stores `userId` when a logged-in user submits via `/request`.

**Guest cabinet:** `pages/account/index.vue` — protected (redirects to `/login` if not authenticated), shows user profile from `users/{uid}`, lists own bookings via `subscribeByUser`, logout button. `/request` form pre-fills `name`/`phone` from `users/{uid}` for logged-in guests.

**Mobile:** Admin layout uses `useDisplay()` from `'vuetify'` (import explicitly — not auto-imported). `layouts/admin.vue` uses `temporary` drawer + `VAppBar` with hamburger on mobile, permanent drawer with rail toggle on desktop. Pages with `VTable` (`/admin/bookings`, `/admin/guests`) render card lists on mobile using `v-if="!mobile"` / `v-else`. `AppCalendar.vue` has responsive CSS for cells < 600px.

**Calendar:** `components/AppCalendar.vue` — shared month-grid component. Props: `bookings: Booking[]`, `showNames: boolean`. Emits `select(booking)` when `showNames=true` and user clicks a booked cell. Handles month navigation, Mon-Sun headers via Intl, day coloring by status (pending=amber, confirmed=blue, blocked=red). Used in `/calendar` (public, no names) and `/admin/calendar` (with names + click → VDialog for confirm/delete).

**i18n:** Locale files at `i18n/locales/{ru,en,de}.json`. Always add keys to all three files. Use `$t('key')` in templates, `useI18n().t('key')` in `<script setup>`. Import types from Vuetify with `import type` to avoid runtime errors.

**Always update PLAN.md and CLAUDE.md** after implementing significant features.

## Codex will review your output once you are done.