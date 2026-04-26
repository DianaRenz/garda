---
name: merge
description: Create a PR and squash-merge it into main
disable-model-invocation: true
allowed-tools: Bash(git:*) Bash(gh:*)
---

Create a pull request for the current branch and squash-merge it.

## Steps

1. Run `git log main..HEAD --oneline` to understand all commits on this branch.

2. Create a PR:
   ```
   gh pr create --title "<title>" --body "<body>"
   ```
   - Title: short, under 70 characters
   - Body: brief summary of changes

3. Squash-merge and delete the branch:
   ```
   gh pr merge --squash --auto --delete-branch
   ```

4. Switch back to main and pull:
   ```
   git checkout main
   git pull
   ```
