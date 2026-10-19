# AGENTS.md

## Product Overview

The Debate App is a web application for organising debate meetings and publishing related content. It is a rewrite of the legacy ASP.NET Web API 2 + Custom Elements implementation described in `docs/specs/L1.md` and `docs/specs/L2.md` (the requirements are the source of truth; the legacy code is not).

Expected output:

- **REST API** (Node.js) exposing attribute-style routes under `api/{resource}/{action}`, camelCase JSON only, CORS enabled for any origin, and a Swagger/OpenAPI description. Resources: meetings, articles, architectures and architecture items, users (including "current user"), and digital assets.
- **Meetings**: create, update, list, retrieve and soft-delete meetings with name, date, start, end, abstract, agenda and minutes.
- **Digital assets**: upload files stored in the database and serve them by unique id or by name with their original content type.
- **Auth**: JWT bearer tokens issued from an OAuth2 resource-owner-password token endpoint; roles carried as claims; protected endpoints validate the token.
- **Soft deletion**: records are never physically deleted via the API; deleted records are excluded from all reads and update matching.
- **Seed data**: an administrative user and an introductory meeting are created when migrations run.
- **Angular SPA**: client-side routes for home, login, meeting list, meeting create and meeting edit; browser history and active nav link stay in sync; meeting editing uses rich-text editors (abstract, agenda, minutes) and date/time pickers; bearer token persisted in local storage and attached to authenticated requests; reusable components (link, header, tab strip, file drop zone, rich-text editor wrapper).
- Items listed under "Not Implemented" in `docs/specs/L1.md` (registration, roles/invitation endpoints, article/user UI, etc.) are out of scope.

## Technology

| Layer    | Choice                                   |
|----------|------------------------------------------|
| Backend  | Node.js (TypeScript), REST API           |
| Database | PostgreSQL, SQL migrations + seed script |
| Frontend | Angular (standalone components, TypeScript) |

## Expected Folder Structure

```
the-debate-app/
├── AGENTS.md
├── CLAUDE.md
├── GEMINI.md
├── README.md
├── docker-compose.yml            # postgres + api + web for local dev
├── docs/
│   ├── specs/                    # L1.md, L2.md requirements
│   ├── mocks/                    # HTML mocks
│   ├── design-system/
│   └── detailed-designs/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── migrations/               # ordered SQL migrations (schema + seed)
│   ├── src/
│   │   ├── main.ts               # bootstrap, server listen
│   │   ├── app.ts                # express app, CORS, JSON, swagger
│   │   ├── config/               # env, db pool, auth settings
│   │   ├── middleware/           # jwt auth, error handler
│   │   ├── auth/                 # token endpoint, identity service
│   │   ├── meetings/             # routes, service, repository
│   │   ├── articles/
│   │   ├── architectures/
│   │   ├── users/
│   │   ├── digital-assets/
│   │   └── shared/               # soft-delete helpers, types
│   └── test/                     # unit + API acceptance tests
├── frontend/                     # Angular workspace (MANDATORY layout, see below)
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   ├── projects/
│   │   ├── api/                  # library: @the-debate-app/api
│   │   │   └── src/lib/
│   │   │       ├── models/       # DTO interfaces mirroring API resources
│   │   │       ├── services/     # one HTTP service per resource (meetings, articles, architectures, users, digital-assets, auth)
│   │   │       ├── interceptors/ # bearer-token interceptor
│   │   │       └── storage/      # local-storage session service
│   │   ├── components/           # library: @the-debate-app/components
│   │   │   └── src/lib/          # one folder per reusable, presentational component
│   │   │       ├── link/
│   │   │       ├── header/
│   │   │       ├── tab-strip/
│   │   │       ├── file-drop-zone/
│   │   │       └── rich-text-editor/
│   │   ├── home/                 # feature library: @the-debate-app/home
│   │   │   └── src/lib/          # smart components + home.routes.ts
│   │   ├── login/                # feature library: @the-debate-app/login
│   │   │   └── src/lib/
│   │   ├── meetings/             # feature library: @the-debate-app/meetings
│   │   │   └── src/lib/          # meeting-list, meeting-edit, meetings.routes.ts
│   │   ├── <feature>/            # every further feature gets its own library project
│   │   └── the-debate-app/       # application: shell and wiring only
│   │       └── src/
│   │           ├── index.html
│   │           ├── main.ts
│   │           ├── styles.scss
│   │           └── app/          # app.component, app.config, app.routes
│   └── e2e/                      # Playwright tests
└── .github/
```

## Frontend Workspace Rules (MANDATORY)

The folder structure above MUST be adhered to. Do not add projects, rename them, or place code outside the folder that owns it.

| Project | Type | Contains | Must NOT contain |
|---------|------|----------|------------------|
| `projects/api` | library | DTO models, HTTP services, interceptors, session/local-storage service | Components, templates, routes, styling |
| `projects/components` | library | Reusable presentational components (inputs/outputs only) | HTTP calls, imports from `api` or any feature project, routes |
| `projects/<feature>` (e.g. `home`, `login`, `meetings`) | library, one or more per feature | Smart components, feature routes, feature-local state; composes `components` and calls `api` | Generic reusable widgets (put in `components`), raw HTTP calls (use `api`), imports from other feature projects |
| `projects/the-debate-app` | application | Bootstrap, app shell, root routes (lazy-load the feature projects), providers/config, global styles | Feature logic, services, reusable components |

Dependency direction: `the-debate-app` → feature projects → `components` and `api`. Feature projects must not depend on each other. `components` and `api` must not depend on each other or on any feature project. Each library exposes its public surface only through its `public-api.ts`.
