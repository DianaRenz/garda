---
name: deploy
description: Build and deploy the app to Firebase Hosting
disable-model-invocation: true
allowed-tools: Bash(npm:*) Bash(firebase:*) Bash(git:*)
---

Build the project and deploy to Firebase Hosting.

## Steps

1. Check for uncommitted changes:
   ```
   git status --porcelain
   ```
   If there are uncommitted changes, warn the user and ask whether to continue or commit first.

2. Build the project:
   ```
   npm run generate
   ```
   If the build fails — stop and report the error. Do NOT deploy.

3. Deploy to Firebase:
   ```
   firebase deploy --only hosting
   ```

4. Report the result: show the hosting URL and confirm success.
