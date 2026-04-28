#!/bin/bash
# check-i18n.sh — PostToolUse hook
# After editing a locale file, verify all 3 locales have the same keys.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only run for locale files
case "$FILE_PATH" in
  */i18n/locales/ru.json|*/i18n/locales/en.json|*/i18n/locales/de.json) ;;
  *) exit 0 ;;
esac

PROJECT_DIR="$CLAUDE_PROJECT_DIR"
RU="$PROJECT_DIR/i18n/locales/ru.json"
EN="$PROJECT_DIR/i18n/locales/en.json"
DE="$PROJECT_DIR/i18n/locales/de.json"

# Extract all leaf keys recursively using jq
extract_keys() {
  jq -r '[paths(scalars)] | map(join(".")) | sort | .[]' "$1" 2>/dev/null
}

RU_KEYS=$(extract_keys "$RU")
EN_KEYS=$(extract_keys "$EN")
DE_KEYS=$(extract_keys "$DE")

MISSING=""

# Check EN missing keys (present in RU but not in EN)
while IFS= read -r key; do
  if ! echo "$EN_KEYS" | grep -qxF "$key"; then
    MISSING+="  en.json missing: $key"$'\n'
  fi
done <<< "$RU_KEYS"

# Check DE missing keys (present in RU but not in DE)
while IFS= read -r key; do
  if ! echo "$DE_KEYS" | grep -qxF "$key"; then
    MISSING+="  de.json missing: $key"$'\n'
  fi
done <<< "$RU_KEYS"

# Check RU missing keys (present in EN but not in RU)
while IFS= read -r key; do
  if ! echo "$RU_KEYS" | grep -qxF "$key"; then
    MISSING+="  ru.json missing: $key"$'\n'
  fi
done <<< "$EN_KEYS"

# Check RU missing keys (present in DE but not in RU)
while IFS= read -r key; do
  if ! echo "$RU_KEYS" | grep -qxF "$key"; then
    MISSING+="  ru.json missing: $key"$'\n'
  fi
done <<< "$DE_KEYS"

if [ -n "$MISSING" ]; then
  # Deduplicate
  MISSING=$(echo "$MISSING" | sort -u)
  echo "i18n key mismatch detected after editing $(basename "$FILE_PATH"):"
  echo "$MISSING"
  echo "Add the missing keys to keep all 3 locales in sync."
fi

exit 0
