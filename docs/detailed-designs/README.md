# Detailed designs

Detailed designs for The Debate App v2, derived from `docs/specs/L1.md` and `docs/specs/L2.md` and the screens in `docs/mocks`. Each feature folder holds a `README.md` and rendered C4, class and sequence diagrams.

## Features

| Subsystem | Feature | Title | L2 requirements |
|---|---|---|---|
| `content` | [`manage-architecture-items`](content/manage-architecture-items/README.md) | Manage architecture items | L2-007, L2-014, L2-016, L2-017 |
| `content` | [`manage-architectures`](content/manage-architectures/README.md) | Manage architectures | L2-006, L2-014, L2-016, L2-017 |
| `content` | [`manage-articles`](content/manage-articles/README.md) | Manage articles | L2-005, L2-014, L2-016, L2-017 |
| `digital-assets` | [`manage-digital-assets`](digital-assets/manage-digital-assets/README.md) | Manage digital assets | L2-010, L2-014, L2-016, L2-017 |
| `digital-assets` | [`serve-digital-asset`](digital-assets/serve-digital-asset/README.md) | Serve a digital asset | L2-012 |
| `digital-assets` | [`upload-digital-asset`](digital-assets/upload-digital-asset/README.md) | Upload a digital asset | L2-011, L2-017, L2-029 |
| `identity` | [`get-current-user`](identity/get-current-user/README.md) | Get the current user | L2-009 |
| `identity` | [`issue-token`](identity/issue-token/README.md) | Issue a token | L2-013, L2-015 |
| `identity` | [`manage-users`](identity/manage-users/README.md) | Manage users | L2-008 |
| `identity` | [`validate-bearer-token`](identity/validate-bearer-token/README.md) | Validate a bearer token | L2-014 |
| `meetings` | [`get-meeting`](meetings/get-meeting/README.md) | Get a meeting | L2-003, L2-024 |
| `meetings` | [`list-meetings`](meetings/list-meetings/README.md) | List meetings | L2-002, L2-023 |
| `meetings` | [`remove-meeting`](meetings/remove-meeting/README.md) | Remove a meeting | L2-004, L2-016, L2-023, L2-024, L2-030 |
| `meetings` | [`save-meeting`](meetings/save-meeting/README.md) | Save a meeting | L2-001, L2-016, L2-017, L2-024, L2-025 |
| `platform` | [`api-conventions`](platform/api-conventions/README.md) | API conventions | L2-017 |
| `platform` | [`seed-data`](platform/seed-data/README.md) | Seed data | L2-018 |
| `platform` | [`soft-delete`](platform/soft-delete/README.md) | Soft deletion | L2-004, L2-016 |
| `web-client` | [`http-client`](web-client/http-client/README.md) | HTTP client | L2-025 |
| `web-client` | [`route-and-navigate`](web-client/route-and-navigate/README.md) | Route and navigate | L2-019, L2-021, L2-022 |
| `web-client` | [`sign-in`](web-client/sign-in/README.md) | Sign in | L2-009, L2-026, L2-027 |
| `web-components` | [`file-drop-zone`](web-components/file-drop-zone/README.md) | File drop zone component | L2-029 |
| `web-components` | [`header`](web-components/header/README.md) | Header component | L2-021 |
| `web-components` | [`link`](web-components/link/README.md) | Link component | L2-020 |
| `web-components` | [`rich-text-editor`](web-components/rich-text-editor/README.md) | Rich-text editor component | L2-024 |
| `web-components` | [`tab-strip`](web-components/tab-strip/README.md) | Tab strip component | L2-028 |

## L2 coverage

| L2 | Designs |
|---|---|
| `L2-001` | [meetings/save-meeting](meetings/save-meeting/README.md) |
| `L2-002` | [meetings/list-meetings](meetings/list-meetings/README.md) |
| `L2-003` | [meetings/get-meeting](meetings/get-meeting/README.md) |
| `L2-004` | [meetings/remove-meeting](meetings/remove-meeting/README.md), [platform/soft-delete](platform/soft-delete/README.md) |
| `L2-005` | [content/manage-articles](content/manage-articles/README.md) |
| `L2-006` | [content/manage-architectures](content/manage-architectures/README.md) |
| `L2-007` | [content/manage-architecture-items](content/manage-architecture-items/README.md) |
| `L2-008` | [identity/manage-users](identity/manage-users/README.md) |
| `L2-009` | [identity/get-current-user](identity/get-current-user/README.md), [web-client/sign-in](web-client/sign-in/README.md) |
| `L2-010` | [digital-assets/manage-digital-assets](digital-assets/manage-digital-assets/README.md) |
| `L2-011` | [digital-assets/upload-digital-asset](digital-assets/upload-digital-asset/README.md) |
| `L2-012` | [digital-assets/serve-digital-asset](digital-assets/serve-digital-asset/README.md) |
| `L2-013` | [identity/issue-token](identity/issue-token/README.md) |
| `L2-014` | [content/manage-architecture-items](content/manage-architecture-items/README.md), [content/manage-architectures](content/manage-architectures/README.md), [content/manage-articles](content/manage-articles/README.md), [digital-assets/manage-digital-assets](digital-assets/manage-digital-assets/README.md), [identity/validate-bearer-token](identity/validate-bearer-token/README.md) |
| `L2-015` | [identity/issue-token](identity/issue-token/README.md) |
| `L2-016` | [content/manage-architecture-items](content/manage-architecture-items/README.md), [content/manage-architectures](content/manage-architectures/README.md), [content/manage-articles](content/manage-articles/README.md), [digital-assets/manage-digital-assets](digital-assets/manage-digital-assets/README.md), [meetings/remove-meeting](meetings/remove-meeting/README.md), [meetings/save-meeting](meetings/save-meeting/README.md), [platform/soft-delete](platform/soft-delete/README.md) |
| `L2-017` | [content/manage-architecture-items](content/manage-architecture-items/README.md), [content/manage-architectures](content/manage-architectures/README.md), [content/manage-articles](content/manage-articles/README.md), [digital-assets/manage-digital-assets](digital-assets/manage-digital-assets/README.md), [digital-assets/upload-digital-asset](digital-assets/upload-digital-asset/README.md), [meetings/save-meeting](meetings/save-meeting/README.md), [platform/api-conventions](platform/api-conventions/README.md) |
| `L2-018` | [platform/seed-data](platform/seed-data/README.md) |
| `L2-019` | [web-client/route-and-navigate](web-client/route-and-navigate/README.md) |
| `L2-020` | [web-components/link](web-components/link/README.md) |
| `L2-021` | [web-client/route-and-navigate](web-client/route-and-navigate/README.md), [web-components/header](web-components/header/README.md) |
| `L2-022` | [web-client/route-and-navigate](web-client/route-and-navigate/README.md) |
| `L2-023` | [meetings/list-meetings](meetings/list-meetings/README.md), [meetings/remove-meeting](meetings/remove-meeting/README.md) |
| `L2-024` | [meetings/get-meeting](meetings/get-meeting/README.md), [meetings/remove-meeting](meetings/remove-meeting/README.md), [meetings/save-meeting](meetings/save-meeting/README.md), [web-components/rich-text-editor](web-components/rich-text-editor/README.md) |
| `L2-025` | [meetings/save-meeting](meetings/save-meeting/README.md), [web-client/http-client](web-client/http-client/README.md) |
| `L2-026` | [web-client/sign-in](web-client/sign-in/README.md) |
| `L2-027` | [web-client/sign-in](web-client/sign-in/README.md) |
| `L2-028` | [web-components/tab-strip](web-components/tab-strip/README.md) |
| `L2-029` | [digital-assets/upload-digital-asset](digital-assets/upload-digital-asset/README.md), [web-components/file-drop-zone](web-components/file-drop-zone/README.md) |
| `L2-030` | [meetings/remove-meeting](meetings/remove-meeting/README.md) |
