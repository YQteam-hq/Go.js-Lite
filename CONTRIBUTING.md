# Contributing Guide

Thank you for considering contributing to Go.js Lite! This guide helps you set up a local environment, develop, test, and submit changes. Please read it fully before submitting, and make sure your changes follow the project's conventions.

---

## Language Policy (Mandatory)

Everything added to this repository must be written in English. This is enforced by CI, it is not just a convention.

### Rules

1. Pull request titles and descriptions must be written in English.
2. Every added line of source code must be written in English. This includes code comments (line, block and doc comments), log messages, error messages and assertion messages.
3. Commit messages and branch names must be written in English.
4. Localized resources are exempt, because holding non-English text is their purpose. The exemption covers files under `i18n/`, `locale/`, `locales/`, `lang/` and `translations/`, and files with the extensions `.po`, `.pot`, `.ftl`, `.arb`, `.resx` and `.properties`.

### Enforcement

- The `English Only` workflow runs on every pull request and fails when it finds non-English characters in the pull request title, in the pull request description, or in any added line of the diff.
- `English Only` is registered as a required status check, so a pull request cannot be merged until it passes.
- Only added lines are inspected, so pre-existing text elsewhere in the repository never blocks a pull request.

### Escape hatch

- If a change genuinely needs non-English text outside the allowed paths, add the `english-check-bypass` label to the pull request. The workflow then reports success instead of failing, so the exception stays visible in the pull request timeline.
- Treat this as a last resort and explain in the pull request description why it is needed.

## About the Project

Go.js Lite is a lightweight server management panel built for PHP shared hosting. It **does not claim the web root**, is mobile-friendly, and covers file management, database management, SSL/ACME, backups, Cron, FTP, and notification monitoring.

Architecture overview:

- **Backend**: PHP 7.4+, with domain-split module files under `backend/` (`core.php`, `common.php`, `files.php`, `auth.php`, `database.php`, `system.php`, `ssl.php`, `backup.php`, `cron.php`, `notifications.php`, `ftp.php`, `htaccess.php`, `monitor.php`, `secscan.php`, `destinations.php`, `upgrade.php`). `api.php` is the single entry point, dispatching requests to module handlers by `/api/<action>` via `router.php` and `backend/Router.php`.
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS, with source code under `src/`.

---

## Environment Requirements

| Dependency | Version   | Notes |
| --- | --- | --- |
| PHP | `>=7.4` | Hard constraint for shared hosting; **PHP 8-only syntax is not allowed** |
| Composer | any recent version | For installing backend test dependencies |
| Node.js | 18+ | Frontend build toolchain |
| npm | 9+ | Installed with Node.js |

> ⚠️ **PHP 7.4 compatibility is a hard constraint**: do not use PHP 8-only syntax such as `enum`, `readonly`, constructor property promotion, or named arguments, so that the panel can run on shared hosting.

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YQteam-dyq/Go.js-Lite.git
cd Go.js-Lite
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Start the backend

The backend only needs PHP's built-in server for development and supports the `/gojs/` prefix:

```bash
php -S 127.0.0.1:8080 router.php
```

`api.php` is the single backend entry point, dispatching requests to module handlers by `/api/<action>` via `router.php` and `backend/Router.php`.

### 4. Start the frontend dev server

```bash
npm run dev
```

The frontend dev server runs at `http://localhost:5173` and automatically proxies `/gojs/api`. Visit `http://localhost:5173/gojs/` to develop.

---

## Build and Checks

```bash
# Local development (hot reload)
npm run dev

# Type checking (passes when there is no output)
npm run typecheck

# Lint (--max-warnings 0, zero tolerance)
npm run lint

# Production build (runs tsc -b, then vite build)
npm run build

# Preview the build locally
npm run preview
```

---

## Running Tests

The backend uses PHPUnit (9.x, compatible with PHP 7.4). Install dependencies before the first run:

```bash
# Install backend dependencies (including phpunit)
composer install

# Run all backend unit tests
vendor/bin/phpunit

# Run a specific test file
vendor/bin/phpunit tests/AuthTest.php
```

The frontend uses Vitest with jsdom. Tests live next to the code they cover, in `src/__tests__/*.test.ts`:

```bash
# Run the frontend suite once
npm run test:run

# Re-run on change
npm test

# Run the suite and enforce the coverage gate on the core modules
npm run test:coverage
```

Coverage is reported for `src/api/client.ts`, `src/stores/authStore.ts`, `src/hooks/useI18n.ts`, `src/i18n`, `src/lib` and `shared/version.ts`. The gate fails below 70% lines, branches, functions and statements on those modules. Add a test whenever you touch one of them.

---

## Code Style Conventions

### Backend (PHP)

- **Target version**: PHP 7.4. No PHP 8-only syntax is allowed (`enum`, `readonly`, constructor property promotion, named arguments, `match`, etc.).
- **Function naming**: public module functions use the `gojs_` prefix, e.g. `gojs_safe_path`, `gojs_json_response`.
- **Comments**: core handler functions use English PHPDoc comments (`@param` / `@return` / behavior description), formatted as:

  ```php
  /**
   * Describes the function behavior.
   *
   * @param string $path The path to validate
   * @return bool Returns true if validation passes, otherwise false
   */
  ```

- **Routing**: to add an endpoint, register it in `gojs_build_router()` in `backend/core.php`; do not modify the business dispatch logic directly.
- **Compatibility**: do not change the HTTP status codes or the JSON structure (`ok` / `code` / `message` / `data`) of existing endpoints.

### Frontend (TypeScript / React)

- Use TypeScript strict mode; avoid overusing `any`.
- Components follow the existing directory structure (`src/components`, `src/routes`, `src/api`, `src/hooks`).
- Styling uses Tailwind CSS consistently; do not introduce additional UI libraries.
- Keep interactions concise and mobile-first.

---

## Frontend Architecture Conventions

These conventions keep the frontend navigable as it grows, and they are what reviewers hold a change to. They cover the `src/core/` and `src/variants/<name>/` trees, and the transitional `src/routes/`, `src/components/` and `src/api/` trees that are still being classified.

### 1. Route modules become directories

A route module that needs more than one file becomes a directory with an `index.tsx` entry point and its private parts beside it. Nothing under `src/routes/` or `src/variants/<name>/routes/` stays a set of flat sibling files once a module outgrows a single file.

```
src/routes/backup/
  index.tsx
  components/
    RemoteRestoreModal.tsx
    ScheduleCard.tsx
    ScheduleModal.tsx
```

The module specifier used by `React.lazy` in `App.tsx` does not change when a file turns into a directory, so `@/routes/backup` keeps resolving through `index.tsx`.

### 2. All HTTP goes through `src/api/`

A component, hook or store never calls `fetch` directly and never builds an API URL by hand. Every request goes through the shared client, which owns the base path, the credentials mode and the response envelope.

- One module per backend domain under `src/api/`.
- Request and response types live next to the module that owns them, or in `shared/types.ts` when more than one module needs them.
- A route that needs a new endpoint adds it to the domain module rather than inlining a call.

### 3. Component ownership

- A component reachable from more than one variant lives in `src/core/components/`.
- A component reachable from exactly one variant lives in `src/variants/<name>/components/`.
- `src/components/` holds what has not been classified yet. Moving one component into `core/` or into a variant is always a welcome standalone change.

### 4. Single-file soft cap

A module under `src/routes/`, `src/variants/<name>/routes/` or `src/core/` does not grow past 800 lines. The cap is a signal to split rather than a build failure, and a split has to hold the chunk count and keep the initial JS within 2 KB of where it started.

### 5. i18n namespaces

Translations are grouped by domain, not by screen. Each namespace maps to one domain (`common`, `settings`, `dashboard`, `users`) and a new key belongs to exactly one of them. Components read keys through `useI18n` and never inline user-facing text.

### 6. Coverage threshold

The coverage gate measures a whitelist of modules rather than the whole tree, and it fails below 70% for lines, branches, functions and statements on those modules. The whitelist grows in steps as modules are split, so a module joins the list in the change that makes it able to hold the threshold.

### 7. Variant ownership

`src/variants/<name>/` may import from `src/core/` and from nothing else. Behaviour shared by two variants belongs in `core/`; behaviour specific to one variant belongs under that variant. A variant importing another variant is a signal that the shared part has not been extracted yet.

---

## Commit Conventions (Conventional Commits)

The Conventional Commits convention is required for every commit of a pull request. The review bot reads every commit message and asks for a rewrite when one does not follow the convention or is not written in English, so a change of wording means a new commit rather than an edited history. This also makes generating CHANGELOGs and locating changes easier:

```
<type>(<scope>): <subject>
```

Common types:

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation-only changes
- `refactor`: refactoring (no behavior change)
- `test`: adding/modifying tests
- `chore`: build or tooling tasks
- `style`: code formatting (does not affect logic)
- `perf`: performance improvements
- `security`: security fixes

Examples:

```text
feat(auth): add TOTP two-factor recovery code endpoint
fix(files): fix memory overflow when uploading very large files
docs: add PHPDoc comments for backend core functions
```

Recommended practices:

- Make each commit focus on a single logical change; avoid mixing unrelated modifications.
- Keep change descriptions concise and clear; add background and impact in the body when necessary.
- Before committing, run `npm run typecheck`, `npm run lint`, and `vendor/bin/phpunit`.

---

## Pull Request Review Bot

The `PR Review` workflow reviews every pull request automatically, and it reviews the pull request again every time new commits are pushed to the branch.

- The review is posted as a single sticky comment that is updated in place, so the pull request timeline stays clean.
- The bot checks the pull request title and description, the required description sections, the checklist items and the added lines of the diff.
- When the review finds no problem, the bot approves the pull request with the `APPROVE` review state. This relies on the `Allow GitHub Actions to create and approve pull requests` repository setting, which is enabled on this repository.
- When a later push stops passing the checks, the bot dismisses its earlier approval, so the pull request has to be reviewed again.
- Add the `review-bypass` label to skip the review, and explain in the pull request description why the exception is needed.

---

## How to Open an Issue / PR

### Opening an Issue

- Use the repository's issue templates (a security vulnerability template is available under `.github/ISSUE_TEMPLATE/`).
- Describe clearly: reproduction steps, expected behavior, actual behavior, and the runtime environment (PHP / Node versions, hosting type).
- For security vulnerabilities, follow the private disclosure process in `SECURITY.md`; **do not submit them publicly**.

### Opening a PR

1. Create a separate branch from `main`, named to describe the change, e.g. `feat/auth-totp`, `fix/files-upload`.
2. Complete your changes following the code style and commit conventions above.
3. Pass `php -l`, `npm run typecheck`, `npm run lint`, and `vendor/bin/phpunit` locally.
4. Submit the PR, describing the motivation, scope, and test coverage.
5. The `PR Review` bot reviews the pull request automatically and approves it when it finds no problem. Maintainers may still suggest changes after review, so please stay in communication.

Thank you for your contribution!
