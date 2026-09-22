# Variant web-server templates

Two `.htaccess` templates ship next to the repository root `.htaccess`, one per
variant that runs behind Apache. Copy the one that matches the distribution you are
deploying and rename it to `.htaccess`.

**Both templates target Apache 2.4 and nothing else.** `Require all denied` does not
exist on Apache 2.2, and the 2.2 `Order` / `Deny` pair does not invert correctly
inside `<LimitExcept>` on every 2.2 build, so a 2.2 host must not deploy these files.
The root `.htaccess` keeps the 2.2 directive set for existing installations; the
templates are its 2.4 rewrite, not a second supported syntax.

| Template | Ship it with | What it adds on top of the shared rules |
|---|---|---|
| `apache.htaccess` | Go.js-Apache | Nothing beyond the shared rule set; it is the deployable form of the front controller and the header policy. |
| `panel.htaccess` | Go.js-Panel | A `LimitExcept` block that refuses every method the read-only panel has no use for. |

## Shared rules

Both files carry the same rule set, directive for directive, apart from the
`<LimitExcept>` block that only `panel.htaccess` has:

- `DirectoryIndex` points at `dist/index.html`, with `index.html` as the fallback for a
  flattened deployment.
- Directory listing is off.
- `.htaccess`, `config.php`, anything matching `^.gojs`, `*.log`, `*.md` and
  `db_connections.json` are refused.
- `/assets/<file>` is served from `dist/assets/<file>` when no file of that name sits
  at the mount point, which is how the `base: '/gojs/'` build reaches its bundles.
- `/api/<action>` is rewritten onto `api.php?api=<action>`.
- `backend/`, `apps/`, `tests/`, `husky/`, `shared/` and `scripts/` plus `router.php`
  and `phpunit.php` are refused, so the only entry points are `api.php`, `webcron.php`
  and `dist/`.
- Unknown paths fall through to `dist/index.html` for the single-page application,
  except requests that look like PHP.
- The header policy sets `X-Frame-Options`, `X-Content-Type-Options`,
  `X-XSS-Protection` and `Referrer-Policy`, and marks PHP responses as non-cacheable.
- `mod_php` gets `display_errors` off, `log_errors` on, `expose_php` off and
  `allow_url_include` off.

## What the panel template answers to each method

The `LimitExcept` block answers at the web server level, before PHP is reached:

| Method | Response | Where the answer comes from |
|---|---|---|
| `GET` | `200`, or the route's own `4xx` | Passed through; the router decides per action. |
| `HEAD` | `200` | Passed through; Apache drops the body. |
| `OPTIONS` | `200` | Passed through so the panel can advertise what it accepts. |
| `POST` | `200`, or the route's own `4xx` | Kept open because signing in and out is a `POST`. |
| `PUT` | `403` | Refused by `<LimitExcept>`. |
| `PATCH` | `403` | Refused by `<LimitExcept>`. |
| `DELETE` | `403` | Refused by `<LimitExcept>`. |
| `TRACE` | `403` | Refused by `<LimitExcept>`. |
| `CONNECT` | `403` | Refused by `<LimitExcept>`. |

A method Apache lets through that the action table does not permit is answered with
`405 method_not_allowed` by the router, which is where the per-action decision
belongs. A future feature that needs `PATCH`, for example a RESTful panel config
write, has to widen the `LimitExcept` list first, because Apache answers `403` before
the router is ever reached.

`apache.htaccess` leaves every method open: the Apache distribution manages virtual
hosts, `.htaccess` files and certificates through the same API.

## How the templates differ from the root `.htaccess`

The templates are a rewrite, not a copy. Every difference is listed here:

| Rule | Root `.htaccess` | Templates | Why |
|---|---|---|---|
| Access control syntax | `Order Allow,Deny` / `Deny from all` | `Require all denied` | Apache 2.4 only, see the note at the top. |
| `DirectoryMatch` on `.gojs/` | present | dropped | `DirectoryMatch` is not valid in `.htaccess` context; the `\.gojs` rewrite rule already refuses those paths. |
| `X-Frame-Options` | `DENY` | `SAMEORIGIN` | Matches what `backend/htaccess.php` generates and what the panel needs when it frames its own pages. |
| `*.md` | not refused | refused | Docs ship inside the deployment and `backend/htaccess.php` refuses them too. |
| `config.php` | `<Files>` deny | `<Files>` deny | Unchanged in effect: the file lives under `.gojs/`, which the rewrite rule already refuses, but the explicit deny keeps working if it is ever moved. |
| `mod_php` hardening | `display_errors`, `log_errors` | plus `expose_php`, `allow_url_include` | Matches the generated default in `backend/htaccess.php`. |
| PHP entry points | only `api.php` is reachable through `FilesMatch` | `api.php` and `webcron.php` both reachable | `gojs_htaccess_default_content()` allows `/api\.php$` only, which would also refuse `webcron.php`; the templates keep the documented entry-point set instead. |
| `RewriteBase` | none | none | Both use relative rewrites so a subdirectory mount needs no edit. |

## Deployment notes

- Both templates use relative rewrites and no `RewriteBase`, so they adapt to a
  subdirectory mount such as `/gojs/` without edits.
- `Require all denied` needs `AllowOverride AuthConfig` (or `All`) on the target
  directory, and `mod_authz_core` must be enabled. On an Apache 2.2 host, neither is
  enough: do not deploy these files there.
- The `mod_rewrite`, `mod_headers` and `mod_php` blocks are wrapped in `IfModule`, so a
  missing module degrades to no rewriting or no header policy rather than a 500.
- The Nginx half of the `BE-Panel-3` acceptance criteria is not covered by these two
  files; it needs a separate server block and is a follow-up.
