# Release Manual

This manual is the operator-facing procedure for cutting a release of any Go.js-Lite variant.
Sections 2 and 3 are the reference the 1.0 plan points at for the build matrix and the release flow.

Four variants ship from this repository, all built from `main`:

| Variant | Entry point | Shipped from |
| --- | --- | --- |
| Go.js-Panel | `backend/public/index.php` + `dist/` | 1.0.0 |
| Go.js-Apache | `backend/public/index.php` + `dist/` | 1.0.0 |
| Go.js-SSH | `backend/cmd/gojs-sshd/main.go` + `dist/` | 0.9.0 Alpha |
| Go.js-Docker | `backend/cmd/gojs-dockerd/main.go` | 0.5.0 Prototype |

Panel and Apache gate the main version. SSH and Docker are optional in the 1.0.0 window: a failing
SSH or Docker job does not block the Panel or Apache release.

## 1. The single version source

### 1.1 Where the version lives

`version.json` is the only place a version number is written by hand. Everything else derives from
it or is checked against it.

| File | What it carries | Updated by |
| --- | --- | --- |
| `version.json` | `schema`, the main `version`, and (schema 2) the per-variant versions | `npm run version:bump` |
| `package.json` | npm mirror of the main version | `npm run version:bump` |
| `package-lock.json` | root `version` and `packages[""].version` | `npm run version:bump` |
| `api.php`, `tests/bootstrap.php` | derived through `gojs_version()`, never a literal | nobody, by design |
| `shared/version.ts` | imports `version.json` | nobody, by design |
| `README.md`, `README.zh-CN.md` | the version badge in the header | `npm run version:bump` |
| `CHANGELOG.md` | the `## [<version>]` section | the release author |

`npm run version:bump` writes `version.json`, `package.json`, `package-lock.json` and both README
badges, then tells the operator that the CHANGELOG section and the documents are still to be written.
It takes the new version as an argument, so the command is `npm run version:bump -- 1.0.0`.

### 1.2 The checks

```sh
npm run version:check
```

The check fails, with one line per problem, when any of the following is untrue:

- `version.json.version` is a semver string.
- `package.json.version` equals it.
- `package-lock.json.version` and `package-lock.json.packages[""].version` equal it.
- `api.php` and `tests/bootstrap.php` contain the `gojs_version()` marker and no hard-coded
  `x.y.z` literal.
- `shared/version.ts` contains the `version.json` marker and no hard-coded `x.y.z` literal.
- Both README badges render exactly the same version.
- `CHANGELOG.md` contains a `## [<version>]` heading for it.

Note what this means for a release: bumping the version is never a one-file edit. The README badges
and the CHANGELOG heading are part of the same change, and `CHANGELOG.md` keeps an entry for every
version that is still referenced by `version.json`.

```sh
npm run validate
```

`validate` runs `version:check`, `typecheck`, `lint` and `format:check` in one pass and is the
quickest local gate before opening a release pull request.

### 1.3 Variant versions

Sub-version numbers live in `version.json` next to the main version. Schema 1 carries only the main
version; schema 2 (the 1.0.0 milestone) adds the per-variant block and keeps schema 1 readable, so a
checkout written before the upgrade is not rejected.

| Variant | Version at 1.0.0 | Relationship to the main version |
| --- | --- | --- |
| Panel | 1.0.0 | equal to the main version |
| Apache | 1.0.0 | equal to the main version |
| SSH | 0.9.0 Alpha | one segment behind, allowed |
| Docker | 0.5.0 Prototype | two segments behind |

## 2. Build matrix

Every variant build is a frontend build plus a backend package step. The frontend variant is chosen
at build time:

```sh
VITE_VARIANT=<panel|apache|ssh|docker> npm run build
```

The backend variant is chosen at deploy or compile time through `GOJS_VARIANT=<name>`.

| Variant | Artifact | Size target | Failure handling |
| --- | --- | --- | --- |
| Panel | `gojs-panel-<version>.tar.gz` | 8 MB | blocks the main version |
| Apache | `gojs-apache-<version>.tar.gz` | 10 MB | blocks the main version |
| SSH | `gojs-ssh-<version>.tar.gz` | 25 MB | skipped, main version unaffected |
| Docker | `gojs-docker-<version>.tar.gz` | 35 MB | skipped, main version unaffected |

Per-variant build scripts live at `scripts/build/<variant>.sh` and are invoked by the release
workflow, one job per variant. `npm run build` is the only build entry point in the tree today; the
`build:<variant>` npm scripts, `scripts/build/` and the release workflow are deliverables of the
build-automation tasks and are not wired yet.

Current size reporting:

```sh
npm run size
```

`size` reads the production build and reports the gzip footprint per chunk. The default budget is
180 KB gzip; a single run can be given a different one through `BUNDLE_BUDGET_KB`, and
`npm run size:report` reports over-budget without failing. The budget this repository commits to and
the numbers behind it are documented in `docs/bundle-budget.md`.

## 3. Release flow

1. Bump the version in one step, so the four derived sources, both README badges and the CHANGELOG
   heading move together:

   ```sh
   npm run version:bump -- <version>
   ```

2. Verify the single version source:

   ```sh
   npm run version:check
   ```

3. Write the CHANGELOG section. `npm run changelog` is the planned generator and does not exist in
   the tree yet, so the section is written by hand from the merged pull requests. Keep the
   subsection order the file already uses: `Added`, `Security`, `Deprecated`, `Changed`,
   `Breaking`.

4. Tag the release commit. The main tag is `v<version>`; a variant that ships on its own version
   tag is tagged as well:

   ```sh
   git tag -s v<version> -m "Go.js-Lite <version>"
   git push origin v<version>
   ```

5. The release workflow runs the four variant jobs from the tag.
6. Panel and Apache succeed, so the GitHub Release is created and both tarballs are attached with
   their checksums.
7. A failed SSH or Docker job does not create its variant release and does not affect the main
   release; the failure reason is recorded on the tracking issue instead.

Steps 4 to 7 depend on the release workflow, which is a deliverable of the release-automation task
and is not in the tree yet. Until it lands, a release is assembled locally with the commands in
section 2 and published by hand.

## 4. Preconditions

A release commit reaches `main` only through a pull request that is green on every required check:

- `Merge Gate` aggregates `php-lint`, the PHP baseline guard, `phpunit` and `frontend`, and fails
  when any of them is not `success`. The same guard job name appears in the `needs` list and in the
  result loop, so renaming a job means updating both in one pull request.
- `English Only` fails on a non-English added line outside the allowed localisation paths.
- `PR Review` requires the pull request template sections, a Conventional Commit title, a ticked
  checklist and an English-only title, body and commit message.

Never tag a commit that is not on `main` and not green on all three.

## 5. Patch releases in the 0.8.x line

A patch release fixes and prepares; it does not change the contract. Its CHANGELOG section states
that no contract was changed and that no deprecated surface was touched, and the release notes
repeat the statement, so an operator can upgrade a patch without reading the migration manual.

A patch never removes a surface that `docs/deprecations.md` lists as deprecated. Only that document
moves a removal date, and the schedule states the release in which each surface stops working.

## 6. Failure and rollback

- A failed Panel or Apache job blocks the release. Fix the failure, then re-run the matrix; do not
  publish a partial release.
- A failed SSH or Docker job drops that variant only. The CHANGELOG section for that variant states
  that it did not ship in this version and that the next window is the target. Do not attach a
  placeholder note that reads as if the variant had shipped.
- Never move a published tag and never overwrite an uploaded artifact. A broken release is
  superseded by a new patch version, so the tag history stays append-only.
- If a draft release is published with the wrong artifacts, delete the draft, re-run the matrix and
  publish again. Once a release is public, only a new version fixes it.
- A rollback of a published patch is a new patch that reverts the change. The deployment side of a
  rollback, including the files to restore and the order to restore them in, is the "Rollback"
  section of the migration manual.

## 7. References

- `docs/deprecations.md` - the removal schedule and how a caller checks whether it is affected.
- `docs/migration-0.8-to-1.0.md` - the upgrade guide; its Checklist and Rollback sections are the
  operator-facing counterpart of this manual. The file is still named
  `docs/migration-0.8-to-0.9.md` in the tree and is renamed as part of the 1.0 documentation
  cleanup.
- `docs/bundle-budget.md` - the frontend budget that `npm run size` enforces.
- `SECURITY.md` - the supported version matrix and the dependency update policy per variant.
