# AGENTS.md

## Overview
- Chrome MV3 extension: `content.js` manipulates ChatGPT DOM, `background.js` is an ephemeral service worker for commands, `popup.*` provides settings UI.
- Uses GSAP for animation; settings stored via Chrome Storage Sync; supports both Windows and macOS modifiers.
- Minimal permissions: primarily "storage" and essential UI access only.
- This file resides at the repository root for Codex-first precedence.

## Validation
- Run the following canonical command to ensure repository health before merging changes:
  ```
  npm ci && npm test
  ```
- This command is the single pass/fail check for all code merges.

## Style & conventions
- **JavaScript:** 4-space indent, single quotes, semicolons.
- **HTML:** 4-space indent. **CSS:** 2-space indent.
- Use descriptive camelCase; suffix Checkbox/Radio for setting flags.
- Prefer consistent styling: optionally use `npm run lint` (eslint) or `npm run format` (prettier) if scripts exist. Codex may help add these scripts if needed for consistency.
- Localize all user-facing text via `_locales/`. Concisely comment complex logic.

## Adding features & shortcuts
- Add new DOM/UI logic in `content.js`. For large or modular features, create a new JS file if it improves clarity.
- Expose new settings/shortcuts in the popup UI (`popup.js`, `popup.html`), sync via Chrome Storage.
- Localize all new labels/tooltips using `_locales/` message keys.
- For background events/commands, use event-driven handlers (no continuous state in `background.js`).
- For debugging, view logs in Chrome’s Extensions page or DevTools console.

## Code structure
```
manifest.json        // MV3 manifest
background.js        // Ephemeral service worker (commands)
content.js           // Content script (shortcuts, UI tweaks)
popup.html/js/css    // Settings UI (Chrome action)
lib/                 // GSAP libraries — READ-ONLY
icons/               // SVG/PNG assets
_locales/            // i18n JSON strings
tests/               // Node reference tests
*.zip                // Archived builds — READ-ONLY
```

## Merge policy
- Commits: use concise, imperative language. Prefix with clear type (e.g., `feat:`, `fix:`).
- Update `CHANGELOG.md` for any user-visible or behavioral change.

## Hard constraints & safety rails
- Never commit secrets, tokens, or user data.
- Never modify third-party libraries in `lib/`, archived builds (`*.zip`), or built-in extension icons (`icons/`). Add new assets only.
- Do not add production dependencies or expand permissions without explicit approval.
- Store all new settings/shortcuts via Chrome Storage Sync and expose in popup UI.
- All new UI text must use `_locales/` keys.
- Prefer linking to existing source files rather than copying excessively large code blocks directly into AGENTS.md.
- Prefer clearly defined or incremental tasks whenever possible. If you encounter unclear tasks, request further clarification rather than assuming limitations.
