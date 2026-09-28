# Contributing to Go.js-Lite

Welcome! This guide covers the architectural conventions that all contributors must follow.

## Architecture Conventions

### 1. Route Directory Structure

- If a route has **more than one file**, it **must be a directory** (e.g., `src/routes/dashboard/index.tsx`)
- Single-file routes are acceptable but must not grow beyond 200 lines
- All routes must be registered in `src/App.tsx`

### 2. Data Access

- All HTTP requests must go through `apiFetch()` in `src/api/client.ts`
- **Never use raw `fetch()`** in route components or shared code
- The `api/client.ts` file is the only place where raw `fetch` is allowed

### 3. Component Ownership

- Components belong to the route that uses them, unless shared across 2+ routes
- Shared components go in `src/components/`
- Variant-specific components go in `src/variants/<variant>/`

### 4. Single File Soft Limit

- Route files: **200 lines** soft limit
- Component files: **100 lines** soft limit
- If a file exceeds this, consider splitting into sub-components

### 5. i18n Namespace Convention

- Translation keys go in `src/i18n/locales/en.ts` and `zh.ts`
- Key format: `<section>.<component>.<description>`
- Example: `dashboard.title`, `settings.profile.save`

### 6. Coverage Threshold

- Minimum line coverage: **50%**
- Target line coverage: **70%**
- New code must not decrease overall coverage below threshold

### 7. Variant Ownership

- Variant-specific code belongs in `src/variants/<variant>/`
- Core/shared code belongs in `src/core/`
- Do not import from another variant's directory

## Development Setup

See [coding-standards.md](./coding-standards.md) for environment setup.

## Pull Request Checklist

- [ ] Title follows Conventional Commits format
- [ ] All commits are in English
- [ ] Code comments are in English
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes (no errors)
- [ ] `npm test` passes
- [ ] Coverage threshold maintained

## Questions

For questions, open an issue or reach out to the team.
