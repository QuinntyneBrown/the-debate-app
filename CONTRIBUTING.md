# Contributing to The Debate App

Thanks for your interest in contributing! This document explains how to get involved.

By participating you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- Report bugs and request features via [GitHub Issues](../../issues).
- Improve documentation in [`docs/`](docs).
- Submit pull requests for bug fixes and features.

## Development setup

See [Getting started](README.md#getting-started) in the README.

## Workflow

1. Fork the repository and create a branch from `master`: `feature/<short-name>` or `fix/<short-name>`.
2. Requirements come first: new behaviour should be reflected in [`docs/specs`](docs/specs) (L1/L2 with acceptance criteria) before code.
3. Write code with tests. Backend changes need unit and API acceptance tests; UI changes need Playwright coverage where applicable.
4. Run the full test suite locally.
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat(meetings): add soft delete`).
6. Open a pull request and fill in the template.

## Project rules

The frontend workspace layout and dependency rules in [`AGENTS.md`](AGENTS.md) are mandatory: do not add, rename or move projects, and respect the dependency direction (`the-debate-app` → feature libraries → `components` and `api`). Each library exposes its public surface only through `public-api.ts`.

## Pull request checklist

- [ ] Tests added or updated and passing
- [ ] Docs/specs updated if behaviour changed
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
- [ ] No secrets or unrelated changes included

## Reporting security issues

Do not open public issues for vulnerabilities. See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
