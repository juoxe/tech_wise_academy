# Design Concept

Status: applied in `frontend/src/styles/globals.css`. Basis: Tech Tool Trainer
[ADR-0008](../../../Tech_Tool_Trainer/docu/adr/0008-frontend-design.md) (colours, dark mode as
default, base size 17 px). Decision for Tech Wise Academy: see [ADR-0003](../adr/0003-frontend-stack.md),
TD-31. The dark-mode greens `#a1cfb8` and `#a0bf76` and the orange for wrong answers were chosen by J.

## Rules

- Colours exist only as tokens in `frontend/src/styles/globals.css`. Components use roles
  (`bg-primary`, `text-muted-foreground`, `text-status-done`), never fixed colour values or
  Tailwind palette classes.
- Every role exists in light (`:root`) and dark (`.dark`) mode.
- Dark mode is the default: `<html class="dark">` in `frontend/index.html`. There is no mode switch yet.
- Text meets WCAG AA contrast (4.5:1 normal text, 3:1 large text and UI borders) in both modes.
  Checked by the sub-agent [`design-token-checker`](../../.claude/agents/design-token-checker.md).

## Colours

| Role | Dark mode | Light mode |
|------|-----------|------------|
| `primary` | `#a0bf76` (olive green) | teal, see `globals.css` |
| `ring` | `#a1cfb8` (light mint) | teal, see `globals.css` |
| `status-done` (correct answers, done) | `#a0bf76` (olive green) | green, see `globals.css` |
| `destructive` (wrong answers, errors) | `#f97316` (saturated orange) | `#c2410c` (darker orange, for contrast on white) |

The logo `frontend/public/logo.svg` uses both greens: mint and olive. It is shown next to the app
title and as the browser icon. It is a brand asset, not a component colour.

The other roles are taken from the Tech Tool Trainer as they are in `globals.css`.

| Role | Use |
|------|-----|
| `background`, `foreground` | page surface and body text |
| `card`, `card-foreground` | cards and panels |
| `primary`, `primary-foreground` | main actions, focus, selection |
| `secondary`, `secondary-foreground` | secondary actions, tags |
| `accent`, `accent-foreground` | hover and selection surfaces |
| `muted`, `muted-foreground` | quiet surfaces and secondary text |
| `destructive` | errors and destructive actions |
| `border`, `input`, `ring` | borders, form fields, focus ring |
| `status-todo`, `status-progress`, `status-done` | status only (open, in progress, done) |
| `path-teal`, `path-indigo`, `path-amber`, `path-rose`, `path-violet` | learning paths only |

## Typography

- **Base size: 17 px** (`html { font-size: 17px }`). All Tailwind `text-*` sizes scale from it.
- **Smallest size: `text-base` (17 px).** Smaller text (`text-sm`, `text-xs`) is not used, because
  counts, notes and table cells must stay readable.
- Scale in use:

| Use | Class |
|-----|-------|
| Body text, table cells, counts, messages | `text-base` |
| Hints and status lines in the game | `text-lg` |
| Tabs and pile names (categories) | `text-lg` |
| Tool names on the piles | `text-base` |
| Card with the current tool in the game | `text-2xl`, `font-semibold` |
| App title | `text-xl`, `font-semibold` |

- Font: the system font (`system-ui`). A design font such as Geist is not chosen yet.

## Layout

- The page uses the full width of the screen (no maximum width on `main`).
- Tabs are left-aligned under the app title, with an underline for the active tab (no boxes).

## Open

- The contrast pairs are not yet measured with a tool; the checker computes them from the colour values.
- The light-mode values of `primary` and `status-done` may be adjusted to the new dark-mode colours
  once J decides it.
- Layout of detail views (dialog or route) is not part of this concept yet.
