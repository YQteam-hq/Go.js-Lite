# Go.js-Lite 1.0.0 - Release Notes

Status: template. Fill every `TBD` at the 1.0.0 tag, then delete this line. The CHANGELOG is the
complete list of changes; this document is the operator-facing summary that accompanies the
release, and it is written for someone upgrading a running installation.

- Release date: TBD
- Main tag: `v1.0.0`
- Release commit: TBD
- Upgrade guide: [docs/migration-0.8-to-1.0.md](migration-0.8-to-1.0.md)
- Removal schedule: [docs/deprecations.md](deprecations.md)

The migration guide is still named `migration-0.8-to-0.9.md` in the tree today and is renamed by the
1.0 documentation cleanup, which lands before this release.

## Highlights

TBD - the three or four changes an operator should read before upgrading.

## Variant releases

Each variant states its version, its artifact and whether it shipped in this window. A variant that
did not ship says so and names the next window; never leave a placeholder that reads as a shipped
release.

### Go.js-Panel 1.0.0

- Artifact: `gojs-panel-1.0.0.tar.gz`
- Size: TBD
- SHA-256: TBD
- Entry point: `backend/public/index.php` with `dist/`
- Changes: TBD

### Go.js-Apache 1.0.0

- Artifact: `gojs-apache-1.0.0.tar.gz`
- Size: TBD
- SHA-256: TBD
- Entry point: `backend/public/index.php` with `dist/`
- Changes: TBD

### Go.js-SSH 0.9.0 Alpha

- Artifact: `gojs-ssh-0.9.0-alpha.tar.gz`
- Size: TBD
- SHA-256: TBD
- Entry point: `backend/cmd/gojs-sshd/main.go` with `dist/`
- Changes: TBD

### Go.js-Docker 0.5.0 Prototype

- Artifact: `gojs-docker-0.5.0-prototype.tar.gz`
- Size: TBD
- SHA-256: TBD
- Entry point: `backend/cmd/gojs-dockerd/main.go`
- Changes: TBD

## Removed

The two deprecated surfaces of the 0.8.x line stop working in this release:

- the `?api=<action>` query form; the path form `/api/<action>` replaces it,
- the legacy access token: the `?token=` parameter, the `X-Access-Token` header and
  `POST /api/regenerate-access-token`.

A call that still uses either surface is answered with a 404 or a 401, and the deprecation response
headers are no longer emitted. The exact replacement for each removed call is listed in the
migration guide.

## Upgrade from 0.8.x

1. Read the Checklist section of the migration guide and confirm every removed call your
   installation depends on has a replacement.
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
