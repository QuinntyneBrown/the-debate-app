# The Debate App

A web application for organising debate meetings and publishing related content.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Running tests](#running-tests)
- [API documentation](#api-documentation)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Code of conduct](#code-of-conduct)
- [Security](#security)
- [Support](#support)
- [License](#license)

## Overview

The Debate App lets organisers create and manage debate meetings (name, date, start/end time, abstract, agenda and minutes) and publish related content. This is the v2 rewrite: a Node.js (TypeScript) REST API, a PostgreSQL database and an Angular single-page application. The requirements in [`docs/specs`](docs/specs) are the source of truth.

> **Status:** v2 is under active development. The `backend/` and `frontend/` folders and the commands below describe the target layout and may not exist yet on every branch.

## Features

- **Meetings** – create, update, list, retrieve and soft-delete meetings with rich-text abstract, agenda and minutes.
- **Digital assets** – upload files stored in the database and serve them by id or name with their original content type.
- **Authentication** – JWT bearer tokens issued from an OAuth2 resource-owner-password token endpoint; roles carried as claims.
- **Soft deletion** – records are never physically deleted via the API and are excluded from all reads.
- **Seed data** – an administrative user and an introductory meeting are created when migrations run.
- **REST API** – `api/{resource}/{action}` routes, camelCase JSON, CORS enabled, Swagger/OpenAPI description.
- **Angular SPA** – home, login, meeting list, meeting create and meeting edit, with date/time pickers and rich-text editors.

## Architecture

| Layer    | Technology                                  |
|----------|---------------------------------------------|
| Backend  | Node.js (TypeScript), REST API              |
| Database | PostgreSQL, SQL migrations + seed script    |
| Frontend | Angular (standalone components, TypeScript) |

Frontend dependency direction:

```
the-debate-app (shell) → feature libraries (home, login, meetings) → components, api
```

Feature libraries do not depend on each other, and `components` and `api` do not depend on each other. See [`AGENTS.md`](AGENTS.md) for the full workspace rules.

## Repository structure

```
the-debate-app/
├── backend/      # Node.js API, migrations, tests
├── frontend/     # Angular workspace (api, components, feature libs, app, e2e)
├── docs/         # specs, mocks, design system, detailed designs
├── .github/      # issue/PR templates, CODEOWNERS
└── docker-compose.yml
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (current LTS)
- [Docker](https://www.docker.com/) (optional, for the one-command setup)
- [PostgreSQL](https://www.postgresql.org/) (if not using Docker)

### Run with Docker

```bash
docker compose up
```

### Run manually

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run migrate
npm start

# Frontend (in a second terminal)
cd frontend
npm install
npx ng serve
```

## Configuration

Backend settings (database connection, JWT secret and expiry, port) are read from environment variables. Copy `backend/.env.example` to `backend/.env` and adjust the values. Never commit real secrets.

## Running tests

```bash
cd backend && npm test        # unit + API acceptance tests
cd frontend && npx ng test    # Angular unit tests
cd frontend && npx playwright test   # end-to-end tests
```

## API documentation

When the backend is running, the Swagger/OpenAPI description is served by the API (see the backend's `app.ts` for the exact path).

## Documentation

- [Requirements (L1/L2)](docs/specs)
- [HTML mocks](docs/mocks)
- [Design system](docs/design-system)
- [Detailed designs](docs/detailed-designs)

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first. See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the people who have helped, and [CHANGELOG.md](CHANGELOG.md) for release notes.

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating you agree to uphold it.

## Security

Please do not report vulnerabilities in public issues. See [SECURITY.md](SECURITY.md).

## Support

See [SUPPORT.md](SUPPORT.md) for how to get help.

## License

Released under the [MIT License](LICENSE).
