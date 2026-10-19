# Debate App design system

Extracted from [docs/mocks](../mocks/index.html) on 2026-10-19. Open [index.html](index.html) locally in Chrome. The design system is the single source of truth for how the Debate App looks: the mocks and the Angular `@the-debate-app/components` library both read `tokens/tokens.css` and `assets/components.css`.

Seeded from the Shelfie design system on 2026-10-19 (tokens unchanged, `components.css` adopted from the mocks' `ui.css`); all copy, examples and sources were then rewritten for the meeting domain.

## Foundations

| Page | Covers |
|---|---|
| [Color](foundations/color.html) | Ramps, semantic roles, pastel avatar tints, both themes, every contrast pair with live ratios |
| [Typography](foundations/typography.html) | Families, scale, weights, line heights, role shorthands, measure |
| [Spacing](foundations/spacing.html) | 4px scale, inside vs between, padding by component |
| [Layout](foundations/layout.html) | Breakpoints, columns, gutters, margins, live grid, top bar, page templates |
| [Elevation](foundations/elevation.html) | Shadows, surfaces, z-order |
| [Shape](foundations/shape.html) | Radii (24px cards, 32px sheets, pill buttons), border widths, avatar and thumbnail sizes |
| [Motion](foundations/motion.html) | Durations, easings, replayable demos, loading loops, reduced motion |
| [Iconography](foundations/iconography.html) | Icon style, sizes, labelling, the 20 icons in the mocks |
| [Theming](foundations/theming.html) | data-theme, OS preference, token tiers, adding a theme, tokens.json |
| [Responsive](foundations/responsive.html) | Mobile-first rules per component, touch, testing matrix |
| [Accessibility](foundations/accessibility.html) | WCAG 2.2 AA commitments, target and control sizes, focus ring |
| [Content](foundations/content.html) | Voice, casing, verbs, dates, error and empty formulas, microcopy |

## Components

25 components. Source mocks are under [docs/mocks](../mocks/index.html) (`pages/`, `dialogs/`, `notifications/`).

| Component | Group | Variants | States | Source mocks |
|---|---|---|---|---|
| [Button](components/button.html) | Actions | primary, secondary, ghost, danger; block; icon-only · sm/md/lg | default, hover, focus, active, disabled, busy | sign-in, meeting-edit, delete-meeting |
| [Link](components/link.html) | Actions | inline, standalone, nav link | default, hover, focus, current | meetings, sign-in |
| [Menu](components/menu.html) | Actions | account menu | closed, open, item hover/focus | account-menu |
| [Form field](components/form-field.html) | Inputs | label, help, error | default, invalid | meeting-edit, meeting-create, sign-in |
| [Text field](components/text-field.html) | Inputs | text, date, time, password with trailing button · sm/md/lg | default, hover, focus, disabled, invalid | meeting-edit, sign-in |
| [Form layout](components/form-layout.html) | Inputs | meeting form header, error summary, danger zone | default, submitting, invalid | meeting-edit, meeting-create |
| [Rich-text editor](components/rich-text-editor.html) | Inputs | toolbar + content; read-only; busy | default, focus, busy, read-only | meeting-edit, meeting-create |
| [Save bar](components/save-bar.html) | Inputs | status + Save | unsaved, saving, saved | meeting-edit |
| [Top bar](components/top-bar.html) | Navigation | brand, nav links, avatar | link hover, focus, current | meetings, meeting |
| [Tab strip](components/tab-strip.html) | Navigation | abstract, agenda, minutes | default, hover, focus, selected | meeting, meeting-edit |
| [Skip link](components/skip-link.html) | Navigation | — | hidden, focused | every page |
| [Layout primitives](components/layout.html) | Containers and overlays | container, stack, cluster, grid, spans, page header, auth layout | — | meetings, sign-in |
| [Card](components/card.html) | Containers and overlays | default, flush, success, warning | — | meetings, sign-in |
| [Dialog](components/dialog.html) | Containers and overlays | destructive, confirm · sheet under 640px | default, busy, failed | delete-meeting, discard-changes |
| [List](components/list.html) | Data display | rows with title and meta | — | meetings |
| [Meeting row](components/meeting-row.html) | Data display | upcoming, past, no date | default, hover, focus | meetings |
| [Prose](components/prose.html) | Data display | headings, lists, paragraphs | — | meeting, meeting-edit |
| [Avatar](components/avatar.html) | Data display | pastel colours · sm/md/lg/xl; button | hover, focus | meetings, account-menu |
| [Logo mark](components/logo-mark.html) | Identity | 64px tile | default | sign-in, home |
| [Toast](components/toast.html) | Feedback | info, success, warning, danger; with action; stacked | entering, timed, leaving | notifications/toast |
| [Alert and banner](components/alert.html) | Feedback | info, success, warning, danger; banner; dismissible | — | notifications/banner, sign-in |
| [Inline message](components/inline-message.html) | Feedback | field error, saving, saved | — | meeting-edit, sign-in |
| [Skeleton](components/skeleton.html) | Feedback | text, title, rect | loading | meetings/loading, meeting/loading |
| [Empty state](components/empty-state.html) | Feedback | first-run, error | — | meetings/empty, meetings/error |
| [Error page](components/error-page.html) | Feedback | not found, forbidden, server error, offline | — | not-found, forbidden, server-error, offline |

### Left out on purpose

`AGENTS.md` locks scope to what the mocks define, so components a generic kit would include but the Debate App never uses are not in this system: checkbox, select, switch, tooltip, sidebar navigation, pagination, stepper, drawer, popover, button group, table, accordion and spinner as its own component.

## Patterns

| Pattern | Covers | Source mocks |
|---|---|---|
| [Forms](patterns/forms.html) | Labels, error summary, save bar, busy submit, discard confirmation | meeting-edit, meeting-create, sign-in |
| [Feedback and loading](patterns/feedback-and-loading.html) | Skeletons, busy buttons, save status | meetings/loading, meeting-edit/submitting, meeting-edit/saved |
| [Empty and error states](patterns/empty-and-error-states.html) | Empty list, load error, not found, offline, server error, forbidden | meetings/empty, forbidden, not-found, offline, server-error |
| [Navigation and page structure](patterns/navigation.html) | Top bar, Back button, tab strip, account menu | any page |
| [Dialogs and overlays](patterns/dialogs-and-overlays.html) | Delete meeting, discard changes, account menu; bottom sheets | dialogs/delete-meeting, discard-changes, account-menu |
| [Lists and tables](patterns/lists-and-tables.html) | The grouped meeting list; loading, empty, edge | meetings/default |
| [Notifications](patterns/notifications.html) | Toast vs banner, status variants, timing, stacking | notifications/banner, notifications/toast |
| [Content and tone](patterns/content-and-tone.html) | Plain, calm microcopy applied to whole flows | sign-in, meeting-create, dialogs |

## Tokens

- `tokens/tokens.css` — source of truth: primitives, semantic tokens, component sizes; light on `:root` and `[data-theme="light"]`, dark on `[data-theme="dark"]` and under `prefers-color-scheme: dark`; reduced-motion, more-contrast and forced-colours overrides. Values are identical to [docs/design-system/tokens/tokens.css](tokens/tokens.css) (only the header comment differs).
- `tokens/tokens.json` — DTCG export generated from `tokens.css` (dark values under `$extensions`). Regenerate, never hand-edit.
- `tokens/contrast-pairs.json` — every foreground/background pairing the components rely on: 103 pairs. Notes describe the Debate App parts they cover.
- `assets/components.css` — the product stylesheet, adopted from the mocks' `ui.css`; `assets/ds.css` and `assets/ds.js` — documentation-site chrome only.

Token names with a `cover` prefix (`--palette-cover-*`, `--color-cover-*`, `--color-tint-*`, `--size-cover-*`) keep their historical names. In the Debate App they are the pastel set used for avatar backgrounds and an optional thumbnail size scale.

## Drift log

Each entry is a mismatch between a mock and the design system, and how it was resolved.

| # | Mock | Issue | Resolution |
|---|---|---|---|
| D1 | whole system | Seeded from the Shelfie design system | seeded from Shelfie design system 2026-10-19, tokens unchanged, components.css adopted from mocks ui.css |

The drift fixes already folded into the seed stylesheet (raw dark-theme values moved to palette primitives, toast icon contrast on the inverse surface, `--duration-loop`, mobile-first queries, `.card__title`, border-width and size tokens) are inherited unchanged and are not repeated here.

## Changelog

### 2026-10-19: Debate App adaptation

- **Added:** [Tab strip](components/tab-strip.html), [Rich-text editor](components/rich-text-editor.html), [Prose](components/prose.html), [Meeting row](components/meeting-row.html) and [Save bar](components/save-bar.html) for the meeting list and editor (`.tabs`, `.editor`, `.prose`, `.meeting`, `.save-bar`, `.meeting-form__header`).
- **Changed:** every foundation and pattern page, the index and this README rewritten for the meeting domain (copy, examples, sources linking the real mocks). A Sources section was added to each foundation page.
- **Removed:** the seed's reading-domain components (title cards, chapter rows, reward and cover pickers, progress and others), the marketing-page pattern, the auth-page effects section and aurora script on Motion, and the bottom tab bar from Layout.
- **Tokens:** none added, changed or removed. Only comments in `tokens.css` and the notes in `contrast-pairs.json` were reworded.

## Verification

Run 2026-10-19.

| Check | Command | Result |
|---|---|---|
| Contrast, both themes | `python3 -I .claude/skills/extracting-design-systems/scripts/check_contrast.py docs/design-system/tokens/tokens.css` | 200 passed, 0 failed, 0 unresolved (both themes) |
| Token export | `tokens_to_json.py docs/design-system/tokens/tokens.css` | wrote `tokens/tokens.json` (330 tokens) |
| Structure | `python3 -I .claude/skills/extracting-design-systems/scripts/check_design_system.py docs/design-system` | 46 pages (25 components, 8 patterns), 0 errors, 0 warnings |
| Token coverage | script over `tokens.css` | Every token has one `data-token` cell on a foundation page (checked by the foundations agent; no separate script) |
| Screenshots | `screenshot_mocks.py docs/design-system` at 360×800 and 1280×800, both themes | Playwright, 6 pages (index, color, button, rich-text-editor, meeting-row, tab-strip) at 360 and 1280 px, light and dark: no horizontal overflow, reviewed 2 shots by eye; the mocks screenshot script does not accept the design-system folder |

Not verified by tooling: a screen-reader pass, 200 % and 400 % zoom, and `forced-colors` rendering.

Mocks now load `tokens/tokens.css` and `assets/components.css` from this folder (their own copies were removed); `check_mocks.py docs/mocks`: 15 screens, 48 mocks, 0 errors. Past date tile moved to `--color-bg-subtle` (was 4.48:1 on `--color-bg-subtle-hover`).
