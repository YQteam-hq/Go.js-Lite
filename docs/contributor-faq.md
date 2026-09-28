# Contributor FAQ

Answers to common questions from contributors. If your question is not answered here, open an issue or start a discussion.

---

## General

### How do I set up a local development environment?

1. Clone the repository: `git clone https://github.com/YQteam-dyq/Go.js-Lite.git && cd Go.js-Lite`
2. Install frontend dependencies: `npm install`
3. Start the backend: `php -S 127.0.0.1:8080 router.php`
4. Start the frontend dev server: `npm run dev`
5. Visit `http://localhost:5173/gojs/`

See [CONTRIBUTING.md](CONTRIBUTING.md#local-setup) for details.

### How do I run the tests?

**Backend (PHPUnit):**
```bash
composer install
vendor/bin/phpunit
```

**Frontend (Vitest):**
```bash
npm run test:run      # Run once
npm test              # Run on change
npm run test:coverage # Enforce coverage gate
```

### What checks does a pull request have to pass?

Every pull request must pass the **Merge Gate**, which aggregates:

1. **PHP Lint** — every PHP file passes `php -l`
2. **PHP 7.4 Compat Guard** — no PHP 8-only syntax in production sources
3. **PHPUnit** — all backend tests pass
4. **Frontend** — typecheck, lint (with zero warnings), and build all pass
5. **English Only** — PR title, description, and all added lines are English
6. **PR Review** — the automated bot approves when it finds no problems

The Merge Gate blocks merging until every check passes.

---

## English Only Policy

### Why does the repository require English only?

The project uses English as its primary language for code, documentation, and communication. This keeps the codebase accessible to contributors worldwide and avoids splitting the review surface between languages.

### What counts as "English only"?

- Pull request titles
- Pull request descriptions
- All added source lines, including comments and log messages
- Commit messages and branch names

### What is exempt from the English only rule?

Localized resources are exempt because holding non-English text is their purpose. The exemption covers:
- Files under `i18n/`, `locale/`, `locales/`, `lang/`, `translations/`
- Files with extensions: `.po`, `.pot`, `.ftl`, `.arb`, `.resx`, `.properties`

### How do I bypass the English Only check?

If a change genuinely needs non-English text outside the allowed paths, add the `english-check-bypass` label to the pull request. The workflow then reports success instead of failing, so the exception stays visible in the pull request timeline. Use this as a last resort and explain in the PR description why it is needed.

---

## PHP Compatibility

### Why is PHP 7.4 compatibility required?

Go.js Lite targets shared hosting environments where PHP 7.4 is often the newest version available. This is a hard constraint, not a preference.

### What PHP 8 syntax is not allowed?

The following PHP 8-only features cannot be used in production sources:
- `enum`
- `readonly` properties
- Constructor property promotion
- Named arguments
- `match` expressions
- Nullsafe operator `?->`

The CI **PHP 7.4 Compat Guard** job checks for these patterns.

### How do I verify my changes are PHP 7.4 compatible?

Run the PHP 7.4 Compat Guard locally by linting with PHP 7.4 if available, or use the grep pattern from the CI job:

```bash
pattern='\bmatch\s*\(|\?->|#\[\s*[A-Za-z\\]|\benum\s+[A-Za-z_]|\breadonly\s+(public|protected|private|\$)|:\s*mixed\b|\bstr_contains\s*\(|\bstr_starts_with\s*\(|\bstr_ends_with\s*\('
```

---

## Code Style

### What code style should I follow?

- **Backend (PHP)**: PHPDoc comments, `gojs_` prefix for public functions, no PHP 8-only syntax
- **Frontend (TypeScript/React)**: TypeScript strict mode, Tailwind CSS for styling, follow existing directory structure

See [CONTRIBUTING.md](CONTRIBUTING.md#code-style-conventions) for the full conventions.

### What are the frontend architecture conventions?

1. **Route modules become directories** — A route that needs more than one file becomes a directory with `index.tsx`
2. **All HTTP goes through `src/api/`** — Never call `fetch` directly; use the shared API client
3. **Component ownership** — Shared components go in `src/core/components/`, variant-specific ones in `src/variants/<name>/components/`
4. **Single-file soft cap** — Route modules should not exceed 800 lines
5. **i18n namespaces** — Translations are grouped by domain, not by screen

See [CONTRIBUTING.md](CONTRIBUTING.md#frontend-architecture-conventions) for the full list.

---

## Pull Requests

### How do I open a pull request?

1. Create a branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes following the code style conventions
3. Run checks locally: `php -l`, `npm run typecheck`, `npm run lint`, `vendor/bin/phpunit`
4. Push and open a PR with a clear description of motivation, scope, and test coverage
5. The PR Review bot will automatically review your pull request

### How should I write commit messages?

Use Conventional Commits format:

```
<type>(<scope>): <subject>

Examples:
feat(auth): add TOTP two-factor recovery code endpoint
fix(files): fix memory overflow when uploading very large files
docs: add PHPDoc comments for backend core functions
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `security`

### Why was my PR approved but the Merge Gate still failing?

The PR Review bot only approves when it finds no problems in the PR title, description, and diff. If the Merge Gate is still failing after approval, check the individual CI jobs for failures. Common causes:

1. **PHP Lint** — syntax error in a PHP file
2. **PHP 7.4 Compat Guard** — PHP 8-only syntax detected
3. **PHPUnit** — a test is failing
4. **Frontend** — typecheck, lint, or build error
5. **English Only** — non-English text detected

### How long does the Merge Gate take?

The Merge Gate polls for results and waits for all required checks to complete. This typically takes 2-5 minutes after pushing. If the gate times out (after ~15 minutes), re-push to trigger a new run.

---

## Testing

### How do I add tests for backend code?

PHPUnit tests live in `tests/`. Create a test file following the existing pattern:

```php
class MyFeatureTest extends TestCase
{
    public function testSomething(): void
    {
        $this->assertTrue(true);
    }
}
```

### How do I add tests for frontend code?

Vitest tests live next to the code they cover in `src/__tests__/*.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

describe('myFeature', () => {
  it('should work', () => {
    expect(true).toBe(true)
  })
})
```

### What is the coverage threshold?

The coverage gate enforces 70% for lines, branches, functions, and statements on:
- `src/api/client.ts`
- `src/stores/authStore.ts`
- `src/hooks/useI18n.ts`
- `src/i18n`
- `src/lib`
- `shared/version.ts`

---

## Dependencies

### How do I add a new npm dependency?

1. Install it: `npm install <package>`
2. Verify the build still works: `npm run build`
3. Verify the size report is within budget: `npm run size`
4. If the budget is exceeded, you may need to find a lighter alternative or defer the addition

### Can I add a new PHP dependency?

New PHP dependencies must be evaluated for shared hosting compatibility. Avoid dependencies that require PHP 8+ or extensions not commonly available on shared hosting. Check with maintainers before adding a significant dependency.
