---
name: audit
description: Run a full project audit — code quality, types, UX, UI, security, i18n, clean code
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
