# AGENTS Instructions for ChatGPT Custom Shortcuts Pro

This repository contains a Chrome extension that adds extensive keyboard shortcuts and small UI tweaks to ChatGPT. It targets chat.openai.com and chatgpt.com. The extension is published in the Chrome Web Store under the same name.

## Key Features
- **Built‑in controls** – shortcuts for native ChatGPT actions (new chat, switch models, regenerate, focus input, toggle sidebar, search, send/stop, navigate between threads, etc.).
- **Extra features** – scrolling controls (top/bottom/one message), quick copy and select, markdown stripping on copy, PgUp/PgDown takeover, moving the top bar to the bottom, and more.
- Works on Windows and macOS; Alt/Option symbols are displayed in the UI.

The full feature history is tracked in `CHANGELOG.md` and at <https://bwhurd.github.io/chatgpt-custom-shortcuts-pro/CHANGELOG.html>.

## Repository Layout
```
manifest.json       Chrome extension manifest (MV3)
background.js       Service worker for commands
content.js          Injected script that implements shortcuts and DOM tweaks
popup.html/css/js   Extension popup for user settings
lib/                GSAP libraries (Flip, ScrollToPlugin, etc.)
icons/              SVG icons used at runtime
_locales/           i18n message files (en, es, hi, ja, ru, uk)
tests/              Node-based tests (file reference checks)
*.zip               Archived release packages (do not modify)
```

## Coding Style
- **JavaScript**: 4‑space indentation, single quotes, semicolons.
- **HTML**: 4‑space indentation.
- **CSS**: 2‑space indentation.
- Keep comments and existing structure intact.
- Do not edit the versioned `.zip` files; they are historical builds.

## Development Notes
- The extension uses GSAP for smooth scrolling and small animations. These libraries live in `lib/` and are bundled via `web_accessible_resources`.
- Translations are handled through the `_locales` folders. Use the existing keys when adding new text.
- `background.js` listens for a single command to open the popup.
- `content.js` is large and handles most functionality. It watches DOM mutations, adds keyboard listeners, and manipulates the ChatGPT page.

## Testing
Run the Node-based file reference test before committing:

```bash
npm install      # no dependencies but keeps Node modules present
npm test         # runs tests/fileReferences.test.js
```

The tests simply ensure that files referenced from `manifest.json` and `popup.html` exist. They must pass.

## Contribution Guidelines
- Follow the style notes above.
- Keep pull requests focused and minimal.
- Update `CHANGELOG.md` when you add or modify user-facing features.
- Use `npm test` to verify referenced files after changes.

