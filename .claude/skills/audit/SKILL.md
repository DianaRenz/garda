---
name: audit
description: Run a full project audit — code quality, types, UX, UI, security, i18n, clean code, mobile-first UX
disable-model-invocation: true
---

Run a comprehensive audit of the entire project. Use parallel subagents where possible to speed up the process.

## Audit areas

### 1. Build & Types
- Run `npm run typecheck` and `npm run build`
- Look for implicit `any`, missing interfaces, incorrect type imports
- Check for `import type` usage where needed (especially Vuetify types)

### 2. Clean Code
- Dead code, unused imports, unused variables
- Code duplication across pages/composables
- Naming consistency (camelCase props, kebab-case events)
- Overly complex functions that should be split
- Missing or unnecessary comments

### 3. UX Review
- Every page has a loading state while data is fetching
- Every async action has error handling visible to the user
- Empty states are handled (no data, no bookings, no photos, etc.)
- Auth guards follow the correct pattern (onAuthStateChanged promise, NOT isLoggedIn.value)
- Redirects make sense (after login, after registration, after logout)
- Form validation covers all edge cases
- Cancel/back buttons exist where expected
- Success feedback is shown after actions (save, delete, submit)

### 4. UI Consistency
- All forms use the same structure (label + field pattern)
- Buttons use consistent styling (gradient primary for main CTA, tonal/text for secondary)
- Mobile responsiveness: check useDisplay() usage, responsive grid columns
- Spacing and layout consistency across pages
- Icons use the fluent:* naming convention

### 5. Security
- No sensitive data exposed in client-side code
- Auth checks on every protected page
- No direct DOM manipulation that could lead to XSS
- Firebase operations use proper error handling
- Invite tokens are validated server-side (Firestore transaction)

### 6. i18n
- All user-visible strings use $t() or $tm()/$rt()
- No hardcoded Russian/English/German strings in templates
- All three locale files (ru, en, de) have the same keys
- Check for missing translations

### 7. Firebase & Reactivity
- All Firestore subscriptions (onSnapshot) are properly unsubscribed
- No memory leaks from watchers or subscriptions
- Proper use of ref() vs useState() (local vs shared state)
- Firebase imports are tree-shaken (import specific functions, not entire modules)

### 8. Accessibility (a11y)
- Form inputs have associated labels
- Images have alt text where applicable
- Interactive elements are keyboard-accessible
- Color contrast is sufficient (check Vuetify theme definitions)

### 9. Mobile-First UX (see reference checklist below)
- Touch targets ≥ 48x48dp, spacing between targets ≥ 8dp
- Forms: single column, input height ≥ 48dp, proper input types (email/tel), autocomplete attributes
- Typography: body ≥ 16px, line-height 1.4-1.6x, line length 45-75 chars
- Loading: skeleton/spinner within 300ms, button loading + disable on submit
- Layout: 16px edge padding on mobile, 4/8px spacing grid, safe-area-inset
- Navigation: bottom bar or clear mobile nav, back button on non-root pages
- Bottom sheets over centered dialogs on mobile, drag handle, no accidental dismiss on forms
- Tables → card lists on mobile, max 3-4 fields per card
- Empty states with icon + message + CTA
- Error states with retry button, no infinite spinners
- Icon buttons without text need aria-label
- Color not the only way to convey status (color + text/icon)
- Content readable at 320px width without horizontal scroll
- prefers-reduced-motion respected

## Output format

Create a prioritized list of findings grouped by severity:

**Critical** — bugs, security issues, broken functionality
**High** — UX problems, missing error handling, type errors
**Medium** — code quality, inconsistencies, minor UX issues
**Low** — style nits, nice-to-have improvements

For each finding include:
- File path and line number
- What the problem is
- Suggested fix (brief)

Start with build/typecheck, then scan all files in parallel, then compile the report.

---

## Reference: Mobile-First UX Checklist

Full checklist for manual or automated review. Sources: Material Design 3, Apple HIG, WCAG 2.2, NNGroup (2025-2026).

### Touch & Interaction
- All interactive elements minimum 48x48dp touch target (even if icon is 24px)
- Minimum 8dp spacing between adjacent interactive elements
- Frequent actions in bottom half of screen (thumb zone)
- Visual/haptic feedback within 100ms of tap
- Horizontal scroll containers have visible indicators or peeking content
- No conflict with system gestures (edge swipe, bottom swipe)

### Navigation
- Bottom tab bar for 3-5 primary destinations (icon + text label)
- Maximum 5 tabs in bottom nav
- Active tab: filled icon + primary color, clear distinction from inactive
- Hamburger menu only for secondary features (<20% of interactions)
- Back button (arrow) in top-left on every non-root page
- Breadcrumbs on mobile: max 1-2 levels or "Back to [Parent]"
- Current page clearly indicated in navigation
- Navigation drawer is temporary on mobile with scrim overlay

### Forms & Input
- Semantic input types: type="email", type="tel", type="url", type="number"
- inputmode for fine-grained keyboard: inputmode="decimal" for prices
- autocomplete on all fields (name, email, tel, street-address)
- Validate on blur, not on every keystroke
- Error messages specific and actionable ("Email must include @")
- Inline errors below field, in red, with error icon
- Single-column layout on mobile (never side-by-side fields)
- Long forms (>5 fields) split into multi-step with progress indicator
- Input field height minimum 48dp
- Labels persistent (floating or outside), not placeholder-only
- Date inputs: native picker or calendar component, not free-text
- <5 options: use radio/chips/segmented, not dropdown
- Viewport doesn't scroll when keyboard opens
- "Show password" toggle on password fields

### Content & Typography
- Body text minimum 16px (preferably 16-18px on mobile)
- Line height 1.4-1.6x font size
- Line length 45-75 characters (use max-width on text containers)
- Max 4 font sizes per screen, differentiate via weight/color/spacing
- Heading hierarchy: 1.3-1.6x body size, min 4-6px between levels
- Long text truncated with ellipsis + way to see full content
- Card titles: single line or max 2 lines with truncation on mobile
- All text selectable (except button labels)

### Loading & Feedback
- Skeleton screen for content loading 1-10s (match layout structure)
- Progress indicator within 300ms if response not available
- Shimmer animation on skeletons (left-to-right, not pulsing)
- Cross-fade from skeleton to content (no flash)
- Progressive loading: above-the-fold first
- Button loading: inline spinner + disable (prevent double-submit)
- Success: snackbar/toast 3-5s at bottom with dismiss
- Error: persistent banner/alert for errors requiring user action
- Destructive actions: confirmation dialog before executing
- Full-page loading: centered spinner with descriptive text

### Layout & Spacing
- Screen-edge padding: 16px (320-479px), 24px (480px+)
- 4px or 8px spacing grid (all margins/paddings in multiples)
- Card-to-card spacing: 16px dense, 24px content-heavy
- env(safe-area-inset-*) for notch devices
- Mobile grid: full-width cols="12" on xs
- Cards full-width on mobile, 2-across tablet, 3-4 desktop
- Bottom nav/FAB: 56-64px bottom padding on content
- Min 48dp vertical spacing between sections
- Content reflows in portrait and landscape
- Readable without horizontal scroll at 320px (WCAG 1.4.10)

### Performance
- LCP < 2.5s
- CLS < 0.1
- INP < 200ms
- Images: explicit width/height or CSS aspect-ratio
- WebP/AVIF with fallbacks
- loading="lazy" on below-fold images, never on LCP image
- Responsive images via srcset
- Lazy-load below-fold components/routes
- Third-party scripts async/deferred
- font-display: swap for web fonts

### Accessibility
- Text contrast: 4.5:1 normal, 3:1 large (≥18px or 14px bold)
- UI component contrast: 3:1 for icons, borders, form controls
- Focus indicator: 2px thick, 3:1 contrast, visible on all interactive elements
- Never remove outline without custom focus style
- All images: meaningful alt or alt="" for decorative
- All inputs: associated label, aria-label, or aria-labelledby
- Icon buttons without text: aria-label describing action
- Status messages: role="alert" or aria-live="polite"
- Logical tab order (matches visual order)
- Touch targets ≥ 24x24 CSS px (WCAG AA), prefer 48x48dp
- Color not the only way to convey info (status = color + text)
- All content accessible at 200% zoom

### Empty & Error States
- Every list: empty state with headline + explanation + CTA
- Illustration/icon in empty states matching brand tone
- Network error: clear message + "Retry" button
- Timeout >10s: error state with retry, not indefinite spinner
- 404: navigation back to known location
- Permission denied: explain why + next step
- First-use: guide new users with helpful messaging
- Empty states responsive on all screen sizes
- Form errors: mark field, scroll to it, preserve user input

### Gestures & Animations
- Swipe-to-dismiss on bottom sheets (if no unsaved data)
- Swipe-to-action on lists: visual cue + undo option
- Gesture affordances: arrows, drag handles, peeking edges
- Transitions 300-500ms with easing
- Animations purposeful (confirm tap, guide attention, state change)
- Respect prefers-reduced-motion
- Pull-to-refresh only at scroll=0 with visual indicator
- Avoid layout-triggering animations (use transform/opacity)
- All gesture actions have button/tap alternative

### Bottom Sheets & Dialogs
- Bottom sheets (not centered dialogs) for mobile actions
- Scrim/backdrop overlay on modal sheets
- Visible close: X button or Cancel/Done action
- Drag handle (pill) at top of bottom sheets
- Full-screen sheets: app bar with X button
- Don't dismiss form/scrollable sheets on backdrop tap
- Confirmation dialogs: two clear actions, destructive in red
- Dialog text: headline + 1-2 sentences max
- Dialogs trap focus (no tabbing to background)
- Small screens: dialogs full-width with 24px horizontal margin

### Lists & Tables
- Tables → card lists on mobile (each row = card)
- 3-4 essential fields per card, secondary behind expand/detail
- Horizontal table: frozen first column + scroll indicator shadow
- List items minimum 48dp height, 8dp vertical padding
- Long lists (>20): virtual scrolling or pagination (10-20/page)
- Infinite scroll: loading indicator at bottom + "End of list"
- Filter controls above list with active filter indicators (chips)
- Empty list: follow empty state pattern
- Visual status indicators (chips, icons) + text labels

### Quick Reference: Minimum Values
| Metric | Value |
|--------|-------|
| Touch target | 48x48dp |
| Target spacing | 8dp |
| Text contrast (normal) | 4.5:1 |
| Text contrast (large) | 3:1 |
| Focus indicator | 2px, 3:1 contrast |
| Body text | ≥ 16px |
| Line height | 1.4-1.6x |
| Line length | 45-75 chars |
| Screen edge padding | 16px mobile, 24px tablet+ |
| Input height | ≥ 48dp |
| Bottom nav height | 56-64px |
| Max nav tabs | 5 |
| Animation duration | 300-500ms |
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| Snackbar duration | 3-5s |
