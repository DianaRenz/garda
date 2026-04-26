---
name: branch
description: Create a new feature branch and push it to origin
disable-model-invocation: true
allowed-tools: Bash(git:*)
---

Create a new git branch and push it to origin.

The user provides a short name as argument: $ARGUMENTS

## Steps

1. Create branch `feature/<short-name>` from current HEAD:
   ```
   git checkout -b feature/<short-name>
   ```

2. Push to origin:
   ```
   git push -u origin feature/<short-name>
   ```

If no name provided, ask the user for a branch name.
