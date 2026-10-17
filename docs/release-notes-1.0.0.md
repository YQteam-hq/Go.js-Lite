# Go.js-Lite 1.0.0 - Release Notes

1.0.0 is a hardening release. It changes what the panel accepts and how it treats an authenticated
session, and it adds a public status page, but it does not change the on-disk layout of `.gojs/` and
it does not remove any endpoint. Read the Upgrade section below before upgrading a production
instance, because four of the changes are behavioural and one of them can sign users out.

- Release date: 2026-10-17
- Main tag: `v1.0.0`
- Release commit: the commit tagged `v1.0.0` on `main`
- Upgrade guide: [docs/migration-0.8-to-1.0.md](migration-0.8-to-1.0.md)
- Removal schedule: [docs/deprecations.md](deprecations.md)

The CHANGELOG is the complete list of changes; this document is the operator-facing summary that
accompanies the release.

## Highlights

1. **Uploads are validated before the file is written.** `backend/upload_guard.php` centralises the
   policy and runs it from both `upload` and `upload-chunk`: extension smuggling, reserved server
   configuration names, over-long names and content that does not match its declared type are
   rejected instead of stored.
2. **An authenticated session is bound to the client it was created with.** The binding rotates
   while the session is live, so a request from a different network or browser is rejected with
   `401 session_fingerprint_mismatch`. Sessions that legitimately move between networks have to sign
   in again.
3. **Every response carries the hardened header policy.** `backend/security_headers.php` emits
   `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`,
   `Cross-Origin-*`, `Strict-Transport-Security` and a context-aware `Content-Security-Policy`, all
   overridable through `config.php`.
4. **Backup archives are integrity-checked.** `backup/create` writes a tamper-evident manifest and a
   sidecar `.sha256`; `backup/verify` recomputes every entry and `backup/precheck` validates the
   restore target. Archives written before 1.0.0 are reported as `legacy`.
5. **The frontend downloads only what the opened route needs.** Route-level code splitting, windowed
   directory listings, an offline shell (service worker + manifest) and a public `/status` page make
   the panel lighter and keep it usable without a network.
6. **Nothing is removed.** The two deprecated surfaces of the 0.8.x line keep working and keep
   answering with the `Deprecation` / `Sunset` headers. Their removal follows the schedule in
   [docs/deprecations.md](deprecations.md).

## Variant releases

Each variant states its version, its artifact and whether it shipped in this window.

### Go.js-Panel 1.0.0

- Artifact: `gojs-panel-1.0.0.tar.gz`
- Size: 0.68 MB (716,129 bytes)
- SHA-256: `5a72e9c128badff7637d4caf2c6fe365b8f5ca2df3e8ed54369fe86396b0f618`
- Entry point: `api.php` (with `router.php` / `webcron.php`) and `dist/`
- Changes: the full hardening set above, plus the frontend performance, offline and accessibility
  work. Ships the Panel `.htaccess` template. See the CHANGELOG for the complete list.

### Go.js-Apache 1.0.0

- Artifact: `gojs-apache-1.0.0.tar.gz`
- Size: 0.68 MB (716,098 bytes)
- SHA-256: `7c5c6368ed5ea333a20a8d3659297416820d495c8d44d7ba17cf017b8ad56409`
- Entry point: `api.php` (with `router.php` / `webcron.php`) and `dist/`
- Changes: the same release as Panel, shipping the Apache 2.4 `apache.htaccess` template (`Require
  all denied`, `LimitExcept`, PHP cache-control). See the CHANGELOG for the complete list.

### Go.js-SSH 0.9.0 Alpha

- Not shipped in this window: the Go daemon is not part of the 1.0.0 code tree yet. The 0.9.0 Alpha
  window is the target.

### Go.js-Docker 0.5.0 Prototype

- Not shipped in this window: the Go daemon is not part of the 1.0.0 code tree yet. The 0.5.0
  Prototype window is the target.

## Removed

Nothing is removed in 1.0.0. The two deprecated surfaces of the 0.8.x line keep working:

- the `?api=<action>` query form, and
- the legacy access token (`?token=`, `X-Access-Token`, `POST /api/regenerate-access-token`).

A call that still uses either surface keeps working and answers with the `Deprecation`, `Sunset`,
`Link ... rel="deprecation"` and `X-Gojs-Deprecations` headers, so an affected caller can detect it
from the response alone. The removal milestone is listed in [docs/deprecations.md](deprecations.md),
which also ships the exact replacement for each deprecated call.

## Upgrade from 0.8.x

1. Read the Checklist section of the migration guide and confirm every deprecated call your
   installation depends on has a replacement before the removal milestone.
2. Confirm the PHP version the new baseline requires, and the storage requirements of this release.
3. Roll out the new artifact; the Rollback section of the migration guide lists how to return to the
   previous version.
4. Verify the installation with `GET /api/bootstrap`.

## Verification

```sh
sha256sum gojs-panel-1.0.0.tar.gz
```

Compare against the SHA-256 published above. The version an installation reports must match the
artifact it runs; `GET /api/bootstrap` returns it.

## Support

Supported versions, the security-fix policy and the dependency update policy per variant are in
[SECURITY.md](../SECURITY.md).
