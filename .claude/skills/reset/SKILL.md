---
name: reset
description: Full project reset — remove caches, reinstall dependencies, verify build
disable-model-invocation: true
allowed-tools: Bash(rm:*) Bash(npm:*)
---

Perform a full project reset when things are broken.

## Steps

1. Remove all caches and dependencies:
   ```
   rm -rf .nuxt node_modules .output package-lock.json
   ```

2. Reinstall dependencies:
   ```
   npm install
   ```

3. Verify the build works:
   ```
   npm run build
   ```

4. Report the result. If the build succeeds, confirm everything is clean. If it fails, show the error.
