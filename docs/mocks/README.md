# The Debate App mocks

Static HTML mocks for every page, dialog and notification of The Debate App v2, in every state, in light and dark, at phone, tablet and desktop widths, with a keyboard. What gets built is what is mocked here, and nothing more.

The product stance: productive and stress-free. One primary action per screen, a title and one line of numbers, short sentence-case copy, no help text unless a rule exists, nothing moving on load except skeleton shimmer.

## How to open them

- Open [index.html](index.html) from disk for the gallery, then click any state.
- Every mock has a bar at the bottom linking its sibling states and toggling the theme (or press `t`).
- `?theme=dark` forces dark, `?theme=light` forces light. `?chrome=0` hides the mock bar and the yellow design notes so the page looks exactly like the product.
- Dialogs are shown over the page they open from; notifications on the page that triggers them. Under 640 px dialogs become bottom sheets.

## Design system

The tokens and the component kit are the **Shelfie design system**, copied verbatim on 2026-10-19 from `C:\projects\shelfie\docs\design-system`:

| Here | From | Notes |
|---|---|---|
| `assets/tokens.css` | `tokens/tokens.css` | Unchanged. Violet accent, rounded type, pill buttons, 24 px cards; 103 contrast pairs verified in both themes. |
| `assets/ui.css` | `assets/components.css` | Unchanged, plus a **"The Debate App additions"** section at the end: `.tabs` (tab strip, L2-028), `.editor` (rich-text wrapper, L2-024), `.prose`, `.meeting` (list row), `.meeting-form__header`, `.save-bar`. |
| `assets/mock.css`, `assets/mock.js` | the writing-html-mocks skill | Mock bar and notes; not product UI. |

Shelfie-only components (book covers, stickers, streaks, chat bubbles, trophies) are still in `ui.css` but no mock uses them; the design-system extraction for this repo drops them.

## Cast and catalog

Every mock tells the same story so a reviewer can follow it across screens. Reuse these names, meetings and dates; do not invent new ones.

<!--
  CAST
  Club:      one debate club uses the app. Members sign in with username + password.
  Admin:     Jordan Reyes, username admin (the seeded user, L2-018). Avatar "J", sky. The signed-in person in every mock.
  Members:   Priya Nair, Samir Haddad, Lena Fischer, Tom Okafor. They appear in abstracts, agendas and minutes only.
  Today:     Monday 19 October 2026, 4:12 pm. Tokens last 120 minutes (L2-013).

  MEETINGS (Tuesdays, 7:00-8:30 pm unless noted)
  Should cities ban cars from downtown?   Tue 20 Oct   upcoming (tomorrow); agenda written, no minutes
  AI in classrooms: help or harm?         Tue 27 Oct   upcoming; abstract only
  Universal basic income                  Tue 13 Oct   past; abstract, agenda and minutes (the full example, id 4)
  Four-day work week                      Tue  6 Oct   past; minutes written
  Introduction                            Tue 29 Sep, 7:00-8:00 pm   past; the seeded meeting (L2-018)
  (edge only) "This house believes that international sporting bodies should be legally required to publish ..." Tue 3 Nov, 7:00-10:15 pm
  (long only) 18 further weekly Tuesday meetings back to May 2026
-->

| Who | Details |
|---|---|
| Jordan Reyes | The signed-in admin. Username `admin`. Avatar "J" in sky. |
| Priya Nair, Samir Haddad, Lena Fischer, Tom Okafor | Members named in agendas and minutes. |
| Today | Monday 19 October 2026, 4:12 pm |

| Meeting | When | Where it is |
|---|---|---|
| Should cities ban cars from downtown? | Tue 20 Oct, 7:00–8:30 pm | Upcoming (tomorrow); agenda, no minutes |
| AI in classrooms: help or harm? | Tue 27 Oct, 7:00–8:30 pm | Upcoming; abstract only |
| Universal basic income | Tue 13 Oct, 7:00–8:30 pm | Past; full abstract, agenda and minutes |
| Four-day work week | Tue 6 Oct, 7:00–8:30 pm | Past; minutes written |
| Introduction | Tue 29 Sep, 7:00–8:00 pm | Past; the seeded meeting |

## Screens

Pages: home, sign-in, meetings, meeting (read-only view), meeting-create, meeting-edit, not-found, forbidden, server-error, offline.
Dialogs: delete-meeting, discard-changes, account-menu.
Notifications: toast, banner.

Items the specs list as "Not Implemented" (registration, roles and invitation endpoints, article and user UI) are not mocked, per AGENTS.md.

## Open questions and assumptions

1. **Edit route.** L2-019 and L2-023 send both View and Edit to `/meeting/:id`. With a read-only view added, the mocks use `/meeting/:id` for the view and `/meeting/:id/edit` for the form. L2 needs a one-line update if this stands.
2. **Sign out, account menu, session expired.** Not in L2. The mocks assume Sign out clears the stored token (L2-026) and that a 401 after the 120-minute token (L2-013) reopens Sign in in its `expired` state. Needs an L2 entry.
3. **Insert image.** The editor shows the image button the spec names (L2-024.4) but its dialog (file drop zone, L2-029, uploading to `/api/digitalasset/upload`, L2-011) is deferred and not mocked.
4. **Header title.** The legacy header said "Architecture"; the mocks say "The Debate App".
5. **Validation.** The API validates nothing. The mocks show two client-side rules only: a name is required, and End must be after Start. Confirm or remove.
6. **No undo for delete.** The API has no restore, so delete confirms once in a dialog and the success toast carries no Undo.
7. **Date and time pickers.** The mocks use native `type="date"` and `type="time"` inputs styled by the kit; the legacy app used Pikaday and Rome. The spec (L2-024.3) only requires a picker to be attached.

## Re-check and re-screenshot

```sh
python -I .claude/skills/writing-html-mocks/scripts/check_mocks.py docs/mocks --write
python -I .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks
```

Screenshots land in `docs/mocks/.cache/mocks/` with a contact sheet; never commit `.cache/`.

## Coverage

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | invalid | submitting | expired | signed-out | long | edge | saved | Requirements |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  | `L2-019`, `L2-022` |
| Sign in (`sign-in`) | [✅](pages/sign-in/default.html) | ➖ | ➖ | [✅](pages/sign-in/error.html) | [✅](pages/sign-in/invalid.html) | [✅](pages/sign-in/submitting.html) | [✅](pages/sign-in/expired.html) | [✅](pages/sign-in/signed-out.html) |  |  |  | `L2-013`, `L2-014`, `L2-019`, `L2-026` |
| Meetings (`meetings`) | [✅](pages/meetings/default.html) | [✅](pages/meetings/loading.html) | [✅](pages/meetings/empty.html) | [✅](pages/meetings/error.html) |  |  |  |  | [✅](pages/meetings/long.html) | [✅](pages/meetings/edge.html) |  | `L2-002`, `L2-004`, `L2-019`, `L2-023` |
| Meeting (`meeting`) | [✅](pages/meeting/default.html) | [✅](pages/meeting/loading.html) | ➖ | [✅](pages/meeting/error.html) |  |  |  |  |  | [✅](pages/meeting/edge.html) |  | `L2-003`, `L2-023`, `L2-030` |
| Edit meeting (`meeting-edit`) | [✅](pages/meeting-edit/default.html) | [✅](pages/meeting-edit/loading.html) | ➖ | [✅](pages/meeting-edit/error.html) | [✅](pages/meeting-edit/invalid.html) | [✅](pages/meeting-edit/submitting.html) |  |  |  | [✅](pages/meeting-edit/edge.html) | [✅](pages/meeting-edit/saved.html) | `L2-001`, `L2-003`, `L2-004`, `L2-024`, `L2-028` |
| New meeting (`meeting-create`) | [✅](pages/meeting-create/default.html) | ➖ | ➖ | [✅](pages/meeting-create/error.html) | [✅](pages/meeting-create/invalid.html) | [✅](pages/meeting-create/submitting.html) |  |  |  |  |  | `L2-001`, `L2-024`, `L2-028` |
| Page not found (`not-found`) | [✅](pages/not-found/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |
| Sign in needed (`forbidden`) | [✅](pages/forbidden/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  | `L2-014` |
| Something went wrong (`server-error`) | [✅](pages/server-error/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |
| Offline (`offline`) | [✅](pages/offline/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |

### Dialogs

| Screen | default | busy | invalid | failed | Requirements |
|---|---|---|---|---|---|
| Delete meeting (`delete-meeting`) | [✅](dialogs/delete-meeting/default.html) | [✅](dialogs/delete-meeting/busy.html) | ➖ | [✅](dialogs/delete-meeting/failed.html) | `L2-004`, `L2-023` |
| Discard changes (`discard-changes`) | [✅](dialogs/discard-changes/default.html) | ➖ | ➖ |  | `L2-024` |
| Account menu (`account-menu`) | [✅](dialogs/account-menu/default.html) | ➖ | ➖ |  | `L2-009`, `L2-026` |

### Notifications

| Screen | info | success | warning | danger | with-action | stacked | persistent | Requirements |
|---|---|---|---|---|---|---|---|---|
| Toast (`toast`) | [✅](notifications/toast/info.html) | [✅](notifications/toast/success.html) | [✅](notifications/toast/warning.html) | [✅](notifications/toast/danger.html) | [✅](notifications/toast/with-action.html) | [✅](notifications/toast/stacked.html) |  | `L2-001`, `L2-004`, `L2-024` |
| Banner (`banner`) | [✅](notifications/banner/info.html) | [✅](notifications/banner/success.html) | [✅](notifications/banner/warning.html) | [✅](notifications/banner/danger.html) |  |  | [✅](notifications/banner/persistent.html) | `L2-013`, `L2-014` |

<!-- coverage:end -->
