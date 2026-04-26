---
name: sync-docs
description: Review the current project state and bring all documentation files up to date
disable-model-invocation: true
---

Review the current state of the project and bring all documentation files up to date.

## Steps

1. **Read all doc files in parallel:**
   - `PLAN.md`
   - `CLAUDE.md`
   - `README.md`
   - Memory file at `/Users/dianarenz/.claude/projects/-Users-dianarenz-Development-garda/memory/MEMORY.md`

2. **Scan the actual codebase** to understand the current implementation:
   - List all pages: `pages/**/*.vue`
   - List all composables: `composables/*.ts`
   - List all components: `components/*.vue`
   - List all layouts: `layouts/*.vue`
   - Check git log for recent commits to understand what changed

3. **Cross-check PLAN.md:**
   - Mark items as ✅ done if they are actually implemented in the codebase
   - Move completed items out of TODO into a "Completed" section
   - Add any new features that exist in code but are not yet in the plan
   - Keep pending/future items clearly separated

4. **Cross-check CLAUDE.md:**
   - Verify that all architectural notes still match the actual code
   - Update any stale descriptions (route structure, composable APIs, auth patterns, navigation)
   - Add notes for any new patterns introduced since the last update

5. **Cross-check README.md:**
   - Update the feature list if needed
   - Do NOT add emojis, do NOT rewrite style — only correct factual inaccuracies

6. **Update the memory file** (`MEMORY.md`) if any implemented features section is out of date. Keep it under 200 lines.

7. **Report** a brief summary of what was changed and what was already correct.

Be conservative: only update what is genuinely stale or missing. Do not rewrite correct content.
