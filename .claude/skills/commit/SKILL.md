---
name: commit
description: Stage all changes, commit with a message, and push to current branch
allowed-tools: Bash(git:*), Read, Edit
---

Stage all changed files, create a commit, and push to the current branch.

## Steps

1. Run `git status` and `git diff` to understand what changed.

2. **Documentation check.** Before committing, review whether the changes require updates to project documentation. Read the following files and update them if the changes introduced new features, changed architecture, modified workflows, or added/changed composables, pages, or components:

   - `CLAUDE.md` — architecture reference, composables, pages, patterns. Update if new files, composables, pages, or conventions were added.
   - `PLAN.md` — project roadmap. Mark completed items, add new planned work if relevant.
   - `README.md` — user-facing project description. Update if the feature set changed.
   - `~/.claude/projects/-Users-dianarenz-Development-garda/memory/MEMORY.md` — Claude's working memory. Update the "Implemented features" section if a new feature was added.

   Skip files that don't need changes. Don't update docs for trivial fixes (typos, style tweaks).

3. Stage all changed files including any updated docs (prefer specific file names over `git add -A`).

4. Write a concise commit message in English using conventional-commits style (`feat:`, `fix:`, `chore:`, `docs:`). Focus on the "why", not the "what".

5. Commit and push:
   ```
   git commit -m "<message>"
   git push
   ```

If a specific commit message is provided as argument, use it: $ARGUMENTS
