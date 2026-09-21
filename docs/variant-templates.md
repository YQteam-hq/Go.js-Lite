# Variant web-server templates

Two `.htaccess` templates ship next to the repository root `.htaccess`, one per
variant that runs behind Apache. Copy the one that matches the distribution you are
deploying and rename it to `.htaccess`.

| Template | Ship it with | What it adds on top of the shared rules |
|---|---|---|
| `apache.htaccess` | Go.js-Apache | Nothing beyond the shared rule set; it is the deployable form of the front controller and the header policy. |
| `panel.htaccess` | Go.js-Panel | A `LimitExcept` block that refuses every method the read-only panel has no use for. |

## Shared rules

Both templates carry the same routing and hardening rules as the root `.htaccess`:

- `DirectoryIndex` points at `dist/index.html`, with `index.html` as the fallback for a
  flattened deployment.
- Directory listing is off.
- `.htaccess`, anything matching `^.gojs`, `*.log`, `*.md` and `db_connections.json`
  are refused.
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

## What makes the panel template different

```apache
<LimitExcept GET HEAD OPTIONS POST>
    Require all denied
</LimitExcept>
```

The read-only panel still signs users in and out, so `POST` stays open; `PUT`,
`PATCH`, `DELETE`, `TRACE` and `CONNECT` are refused with `403` before the request
reaches PHP. Anything the panel does allow at the web-server level and the action
table does not permit is answered with `405 method_not_allowed` by the router, which
is where the per-action decision belongs.

`apache.htaccess` leaves every method open because the Apache distribution manages
virtual hosts, `.htaccess` files and certificates through the same API.

## Deployment notes

- Both templates use relative rewrites and no `RewriteBase`, so they adapt to a
  subdirectory mount such as `/gojs/` without edits.
- `Require all denied` needs `AllowOverride AuthConfig` (or `All`) on the target
  directory; on Apache 2.2 the equivalent is the `Order deny,allow` / `Deny from all`
  pair.
- The `mod_headers` and `mod_php` blocks are wrapped in `IfModule`, so a missing module
  degrades to no header policy rather than a 500.
