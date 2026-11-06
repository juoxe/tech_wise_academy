# Design Concept

Status: applied in `frontend/src/styles/globals.css`. Basis: Tech Tool Trainer
[ADR-0008](../../../Tech_Tool_Trainer/docu/adr/0008-frontend-design.md) (colours, dark mode as
default, base size 17 px). Decision for Tech Wise Academy: see [ADR-0003](../adr/0003-frontend-stack.md),
TD-31. The greens and the orange for wrong answers were chosen by J. On 2026-11-02 J asked for
stronger greens and for the green instead of the olive as the primary colour. On 2026-11-03 J asked for
more yellow and light green: light green is `primary`, yellow is `secondary` (progress bars). J then
asked for dark green headings: the title and all headings use the role `heading`.

## Rules

- Colours exist only as tokens in `frontend/src/styles/globals.css`. Components use roles
  (`bg-primary`, `text-muted-foreground`, `text-status-done`), never fixed colour values or
  Tailwind palette classes.
- **Only the dark mode is supported for now** (J, 2026-11-06): `<html class="dark">` in `frontend/index.html`, no
  mode switch. Every role is checked in dark mode only. The light values stay in `globals.css` (`:root`) as a
  start and are **not checked**; the contrast values for the light mode below are estimates. Finishing the
  light mode is the idea TWA-7.17.
- Every role exists in light (`:root`) and dark (`.dark`) mode.
- Text meets WCAG AA contrast (4.5:1 normal text, 3:1 large text and UI borders) in dark mode (the only mode checked for now).
  Checked by the sub-agent [`design-token-checker`](../../.claude/agents/design-token-checker.md).

## Colours

| Role | Dark mode | Light mode |
|------|-----------|------------|
| `primary` (buttons, tab bar, focus) | `#9ccc65` (light green) | `#4d7c0f` (dark lime green, for contrast on white) |
| `heading` (title, "Wise" in the logo, large headings `h1`, `h2`) | `#27ae60` (the dark green of the logo) | `#1d8348` (a darker shade of the logo green, for contrast on white) |
| `subheading` (sub-headings `h3`, `h4`) | `#9ccc65` (light green) | `#4d7c0f` (lighter green, for contrast on white) |
| `progress-1` (0 to 19 %, red) | `#ef4444` | `#b91c1c` |
| `progress-2` (20 to 39 %, orange) | `#fb923c` | `#c2410c` |
| `progress-3` (40 to 59 %, yellow) | `#facc15` | `#a16207` |
| `progress-4` (60 to 79 %, light green) | `#a3e635` | `#5f9a0b` |
| `progress-5` (80 to 100 %, dark green) | `#22a352` | `#166534` |
| `secondary` (secondary actions, tags) | `#f1c40f` (sunflower yellow) | `#a16207` (dark yellow, for contrast on white) |
| `ring` (focus) | `#9ccc65` (light green) | `#4d7c0f` (dark lime green) |
| `status-done` (correct answers, done) | `#8bc34a` (olive green) | green, see `globals.css` |
| `destructive` (wrong answers, errors) | `#f97316` (saturated orange) | `#c2410c` (darker orange, for contrast on white) |

Contrast (WCAG): text on `primary` with `primary-foreground` 10.0:1 (dark) and 4.8:1 (light).
`heading` on the page 6.9:1 (dark) and 4.6:1 (light), `subheading` on the page 10.6:1 (dark) and 4.8:1 (light). The progress colours on the track of a bar (`muted`) all have at least 3:1 as UI elements: dark mode 4.4:1 (red) to 11.0:1 (light green), light mode 3.0:1 (light green) to 6.3:1 (dark green). The tab text in `primary` 10.6:1 (dark) and 4.8:1 (light). The values were computed from the tokens on 2026-11-06.

The logo `frontend/public/logo.svg` shows three cards stepping up to the right: the dark green
`#27ae60` at the left, the olive `#8bc34a` in front of it and, as a third colour, sunflower yellow
`#f1c40f` at the top right, in front of both. The logo colours are brand assets. The component colours
are the tokens above. The dark green of the logo is `heading` (in dark mode exactly, in light mode a
darker shade for contrast on white); the title "Tech Wise Academy" uses `heading` for "Wise". Light
green is `primary` and `subheading`, yellow is `secondary`, olive stays `status-done`.

Use of the colours:

- **Primary (light green):** buttons (Starten, Nochmal spielen, Nächste Runde) and the tab bar: the active tab has
  green text and a green underline. Focus outlines are green.
- **Heading (dark green):** the title and the large headings (`h1`, `h2`, set once in `globals.css`, so components do
  not need a colour class). A component can still override the colour with a `text-*` class.
- **Subheading (light green):** the sub-headings (`h3`, `h4`), also set once in `globals.css`. Large headings are
  dark green, sub-headings light green, so that the two kinds can be told apart by colour. Both pass
  4.5:1 on `background` and `card`. On a `muted` surface the light `subheading` (4.4:1) and the dark
  `heading` (4.3:1) fall short, so headings are not placed on `muted`.
- **Progress (red to dark green):** every progress bar (game progress, area progress, statistics) takes its colour
  from its percentage in steps of 20 %: red, orange, yellow, light green, dark green. All bars use the shared
  component `ProgressBar` (`components/shared/progress-bar.tsx`); no bar sets its own colour.
- **Secondary (yellow):** secondary actions and tags, no longer progress bars.
- **Status-done (olive):** only for correct answers and done states, never for progress bars (they use `progress-*`).

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
| `progress-1` to `progress-5` | progress bars only, by 20 % steps |
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
