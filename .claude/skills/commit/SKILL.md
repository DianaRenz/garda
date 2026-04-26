---
name: commit
description: Stage all changes, commit with a message, and push to current branch
disable-model-invocation: true
allowed-tools: Bash(git:*)
---

Stage all changed files, create a commit, and push to the current branch.

## Steps

1. Run `git status` and `git diff` to understand what changed.

2. Stage all changed files (prefer specific file names over `git add -A`).

3. Write a concise commit message in English using conventional-commits style (`feat:`, `fix:`, `chore:`, `docs:`). Focus on the "why", not the "what".

4. Commit and push:
   ```
   git commit -m "<message>"
   git push
   ```

If a specific commit message is provided as argument, use it: $ARGUMENTS
