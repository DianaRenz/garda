---
name: merge
description: Review changes, create a PR and squash-merge it into main
disable-model-invocation: true
---

Review the current branch, create a pull request, and squash-merge it.

## Step 1: Review before merge

Run in parallel:
- `git log main..HEAD --oneline` — list of commits
- `git diff main...HEAD --stat` — changed files
- `git diff main...HEAD` — full diff
- `npm run build` — verify build passes

Read the full diff. For every changed file, read the FULL file and check:

- **Bugs:** wrong conditions, missing null checks, race conditions, edge cases (empty arrays, undefined, missing docs)
- **Security:** XSS via v-html with user input, missing auth guards, exposed secrets
- **i18n:** new user-visible strings missing $t(), keys missing from any of the 3 locale files (ru/en/de)
- **UX:** missing loading/error/empty states, broken mobile layout

If the build fails — stop and report. Do NOT create a PR.

If critical issues found — list them and ask the user whether to proceed or fix first.

If only minor issues or none — proceed to Step 2, listing any suggestions at the end.

## Step 2: Create PR

```
gh pr create --title "<title>" --body "<body>"
```
- Title: short, conventional-commits style, under 70 chars
- Body: brief summary of changes + review findings (if any)

## Step 3: Merge

```
gh pr merge --squash --auto --delete-branch
```

## Step 4: Switch to main

```
git checkout main
git pull
```
