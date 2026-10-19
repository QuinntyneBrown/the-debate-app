# Manage articles

## Overview

The Debate App publishes content next to its meetings. An *article* is a titled piece of content. This feature creates, updates, lists, retrieves and soft-deletes articles through the REST API.

**add-or-update** — single operation that creates a record when no non-deleted record matches the supplied `id` and overwrites the matching record otherwise

The Angular client has no screen for this resource: article, architecture and user interfaces are listed under "Not Implemented" in `docs/specs/L1.md` and are out of scope in `AGENTS.md`. The feature is API only, and `docs/mocks` contains no page, dialog or notification for it. A client service in `projects/api` is optional and is `<TO SUPPLY>`.

## Description

The slice runs from the Express router to the `articles` table.

- **`article.routes`** — Express router in `backend/src/articles`. It maps `POST api/article/add` and `PUT api/article/update` to the add-or-update handler, and maps `GET api/article/get`, `GET api/article/getById` and `DELETE api/article/remove`.
- **`jwtAuth` middleware** — in `backend/src/middleware`. It is applied to every route except `get`.
- **`ArticleService`** — application service in `backend/src/articles`. `addOrUpdate` finds the non-deleted article by `id`, then overwrites `title` or inserts a new record. A request for a new article carries `id` `0`.
- **`ArticleRepository`** — data access. Every lookup filters on `is_deleted = false`.
- **`ArticleDto`** — `id` and `title` only.

**Authentication.** `get` is anonymous. `add`, `update`, `getById` and `remove` require a valid bearer token, validated by the JWT middleware of the auth subsystem (L2-014). A request without a valid token receives HTTP 401.

**Missing record.** For `getById` and `remove`, an unknown or soft-deleted `id` makes the request fail. The status code of the new API for that case is `<TO SUPPLY>`.

The legacy API validates nothing. Constraints on `title` (maximum length, whether an empty value is accepted) are `<TO SUPPLY>`.

| Operation | Method and route | Auth | Result |
|-----------|------------------|------|--------|
| Add | `POST api/article/add` | bearer | HTTP 200 `{ id, title }` |
| Update | `PUT api/article/update` | bearer | HTTP 200 `{ id, title }` |
| List | `GET api/article/get` | anonymous | HTTP 200 array of `{ id, title }` |
| Get | `GET api/article/getById?id={id}` | bearer | HTTP 200 `{ id, title }` |
| Remove | `DELETE api/article/remove?id={id}` | bearer | HTTP 200 `id` |

## Requirements

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-005` | `L1-002` | `ArticleController` routes shall be `add` (POST), `update` (PUT), `get` (GET, anonymous), `getById` (GET) and `remove` (DELETE), and the DTO shall expose only `id` and `title`. With a valid bearer token, `POST api/article/add` with `{ id: 0, title }` shall create an article with that `title` and return `{ id, title }`, `PUT api/article/update` shall overwrite the `title` of a non-deleted article, and `DELETE api/article/remove?id={id}` shall set `IsDeleted` and return the `id`. Without credentials, `GET api/article/get` shall return all non-deleted articles as `{ id, title }`, and `getById`, `add`, `update` and `remove` shall return HTTP 401. A soft-deleted article shall not be returned by `getById` or `get`. |
| `L2-014` | `L1-006` | A request to a protected endpoint carrying `Authorization: Bearer {valid token}` shall be authorized. A request without an `Authorization` header, or with an expired, wrong-audience, wrong-issuer or invalid-signature token, shall receive HTTP 401. |
| `L2-016` | `L1-007` | A record removed through its `remove` action shall remain in the database with `IsDeleted = true`. A record with `IsDeleted = true` shall be excluded from `get` and `getById`, and an add-or-update request carrying its `id` shall insert a new record. |
| `L2-017` | `L1-008` | The system shall return JSON with camelCase property names for every API response. |

## Diagrams

### System context

An authenticated API client manages articles through The Debate App. No user interface exists for this resource (see Overview).

![C4 system context for articles](diagrams/c4-context.png)

### Containers

The API client calls the REST API directly, and the REST API reads and writes PostgreSQL. No web client container takes part.

![C4 container view for articles](diagrams/c4-container.png)

### Components

The router applies the token middleware to protected routes and calls `ArticleService`, which uses `ArticleRepository`.

![C4 component view for articles](diagrams/c4-component.png)

### Class structure

`ArticleService` maps between `ArticleDto` and the `Article` entity, which carries `isDeleted`.

![Class diagram for articles](diagrams/class-structure.png)

### Behaviour — add or update

A valid token is required. The service updates a non-deleted match or inserts a new record (L2-005).

![Sequence diagram for adding or updating articles](diagrams/sequence-save.png)

### Behaviour — read

The list is anonymous. `getById` requires a valid token (L2-005).

![Sequence diagram for reading articles](diagrams/sequence-read.png)

### Behaviour — remove

A valid token is required. The service sets the soft-delete flag (L2-005).

![Sequence diagram for removing articles](diagrams/sequence-remove.png)
