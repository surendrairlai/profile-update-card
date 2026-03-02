# Profile Update Card

React Flow + TipTap implementation of the **Update profile field** canvas card.

## Getting started

```bash
npm install
npm start
```

Opens at `http://127.0.0.1:5173`

Needs Node `>=20.19` or `>=22.12` (Vite 7 thing).

---

## What's in here

### Canvas

Custom React Flow node (`UpdateContactFieldNode`). Left handle for incoming connections, right `+` handle for outgoing. Dotted background and styled controls to match Turn.io's look.

### Field picker

Dropdown with all the default fields (name, surname, location, opted_in, language, birthday, is_blocked, status) plus a bunch of custom fields based on real Turn.io programmes (MomConnect, TB Check, etc.).

- Search and keyboard nav (arrows, Enter, Escape)
- Inline custom field creation — pick a name, type, and optional enum values. Shows up in the list right away
- Type icons next to each field

### Value editor (TipTap)

Stays disabled until you pick a field. Type `@` to get expression suggestions (using TipTap's Mention extension). There's also an `@` button that does the same thing.

Expressions show up as highlighted chips in the editor (`@contact.name`, etc.). The suggestion list includes contact fields, system props (WhatsApp Profile Name, Last Seen At, etc.), and utility functions like `@date(year,month,day)` and `@now()`. If the active field is a custom one, its expression gets pinned to the top.

### Type-specific pickers

| Type | What you get |
|---|---|
| text | Just the TipTap editor |
| boolean | Yes/No dropdown with search + keyboard nav |
| date | Calendar with month navigation, highlights today + selected |
| enum | Scrollable list with search + keyboard nav. Language field has 7k+ entries so it uses virtual scrolling |

### After picking a value

Shows inline as plain text — `[value] [× clear] [picker icon]`. Hitting × clears and reopens the editor. Picker button stays so you can reselect without clearing first.

### Saving

Every change logs to console: `console.log('[SAVE] …', { nodeId, fieldId, rawValue, displayValue, isPicked })`. `rawValue` is what you'd store (booleans, ISO dates, language codes), `displayValue` is the human-readable version.

---

## Some architecture notes

**Virtual scrolling in EnumPicker** — The language list is 7k entries. Rendering all of them kills performance. Went with a simple absolute-positioned virtual window (~40 lines, no extra deps).

**`useMemo` for base expressions** — Default field expressions don't change, so they're pre-computed once. Custom field expressions get prepended at call time.

**`key` prop on ValueEditor** — Changing the field resets the TipTap doc by forcing a remount. Way simpler than trying to clear ProseMirror state manually.

**Source handle as `+`** — It's a React Flow `Handle`, not a button. Wrapping a real button inside would break drag-to-connect. The `+` is just a label.

**Code splitting** — Languages, React/React Flow vendor code, and the TipTap editor each get their own chunk via Vite's `manualChunks`. Keeps everything under 430 KB compressed.

---

## Known trade-offs

- Date picker doesn't restore the previously picked date when you reopen it — would need to parse the ISO value back into year/month/day state
- Expression search only works through the `@` trigger (TipTap Mention behaviour). A standalone search input would be nicer but means bypassing the extension
- Keyboard nav in enum picker is tied to the search input — if there are ≤5 options the search hides and arrows stop working. Doesn't matter in practice since all current lists are bigger
- No undo/redo for picker selections — TipTap handles text undo fine, but picker values live in React state outside ProseMirror
