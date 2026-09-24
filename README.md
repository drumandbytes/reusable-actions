# reusable-actions

Shared reusable GitHub Actions workflows for the **drumandbytes** organization.

This repository is public out of necessity rather than preference: a public
repository cannot call a reusable workflow stored in a private one, and several
of the org's repos are public. Nothing sensitive lives here — every workflow is
generic, with repo-specific values (directories, project names, account IDs)
passed in as inputs or secrets by the caller.

## Versioning

Callers should pin to the floating major tag (`@v1`), which moves forward with
backwards-compatible changes:

```yaml
uses: drumandbytes/reusable-actions/.github/workflows/<workflow>.yml@v1
```

Release tags are treated as immutable. A breaking change gets a new major tag
rather than a rewrite of an existing one.

## Workflows

| Workflow | What it does |
|---|---|
| [`deploy-cloudflare-worker.yml`](#deploy-cloudflare-workeryml) | Deploy an npm-based Worker from a subdirectory |
| [`deploy-cloudflare-pages.yml`](#deploy-cloudflare-pagesyml) | Build and deploy a Pages site |
| [`indexnow.yml`](#indexnowyml) | Submit a site's sitemap URLs to IndexNow after a deploy |
| [`node-ci.yml`](#node-ciyml) | Lint plus a per-package check matrix (npm or pnpm) |
| [`go-ci.yml`](#go-ciyml) | Build, vet, gofmt, test, golangci-lint, hadolint |
| [`python-action-ci.yml`](#python-action-ciyml) | Lint, test and structure checks for a Python GitHub Action |
| [`opentofu-validate.yml`](#opentofu-validateyml) | `tofu fmt` and `tofu validate`, no credentials |
| [`security-scan.yml`](#security-scanyml) | Trivy scan of the source tree or a built image |
| [`auto-merge.yml`](#auto-mergeyml) | Enable auto-merge on Dependabot / release PRs once CI passes |
| [`release-please.yml`](#release-pleaseyml) | Release PRs, tags and GitHub Releases from Conventional Commits |

Common to all of them:

- **`runner`** — every workflow except `go-ci` and `python-action-ci` takes a
  `runner` input (default `ubuntu-latest`) to move its jobs onto self-hosted
  runners.
- **Timeouts** — every job is capped at 60 minutes.
- **Node version** — the Node-based workflows read `node = "…"` from the
  nearest `mise.toml` / `.mise.toml`, searching from the working directory up
  to the repo root. The `node-version` input is only the fallback. The lookup
  is the composite action `.github/actions/resolve-node-version`, which the
  workflows call with GitHub's `$/` syntax so it always runs from the same
  commit as the workflow itself.
- **Self-hosted runners** — need Actions runner **2.336.0 or newer** (for
  `$/`), plus `node`, `jq` and `unzip` on the host. GitHub-hosted runners have
  all of these. Node workflows skip the Actions dependency cache there: the
  VM's own `~/.npm` / pnpm store already persists between runs.

### `deploy-cloudflare-worker.yml`

Deploys an npm-based Cloudflare Worker that lives in a subdirectory of the
calling repository. Concurrent deploys of the same worker and ref queue up
rather than race; only the newest waiting run proceeds.

| Input | Required | Default | Description |
|---|---|---|---|
| `working-directory` | yes | — | Directory holding the worker's wrangler config and `package.json` |
| `node-version` | no | `24` | Fallback Node.js version (see mise note above) |
| `install-dependencies` | no | `true` | Run `npm ci` first. `false` for workers with no `package-lock.json` (Node is still set up for wrangler) |
| `runner` | no | `ubuntu-latest` | |

| Secret | Required | Description |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | yes | Token with Workers deploy permission |
| `CLOUDFLARE_ACCOUNT_ID` | yes | Cloudflare account ID |

```yaml
name: Deploy api-worker

on:
  push:
    branches: [main]
    paths:
      - 'api-worker/**'
      - '.github/workflows/deploy-api-worker.yml'

jobs:
  deploy:
    uses: drumandbytes/reusable-actions/.github/workflows/deploy-cloudflare-worker.yml@v1
    with:
      working-directory: api-worker
    secrets:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

The `paths` filter stays in the caller — a reusable workflow cannot define its
own triggers.

### `deploy-cloudflare-pages.yml`

Builds and deploys a Cloudflare Pages site. Defaults target a Vite-style app
(npm install, build to `dist/`), so a typical caller passes only
`project-name`. Deploys queue per project and ref, like the Worker deploy.

| Input | Required | Default | Description |
|---|---|---|---|
| `project-name` | yes | — | Cloudflare Pages project to deploy to |
| `working-directory` | no | `.` | Directory containing the site |
| `install-dependencies` | no | `true` | Run `npm ci` first; `false` for static sites with no lockfile (Node is still set up) |
| `build-command` | no | `npm run build` | Shell command run before deploy; empty string deploys sources as-is |
| `output-directory` | no | `dist` | Directory wrangler publishes, relative to `working-directory` |
| `node-version` | no | `24` | Fallback Node.js version |
| `build-env` | no | `{}` | JSON object of build-time env vars, e.g. Vite `VITE_*` values |
| `runner` | no | `ubuntu-latest` | |

Secrets as for the Worker deploy. Callers must grant `deployments: write` so
wrangler can record a GitHub Deployment — a reusable workflow cannot elevate
the caller's permissions.

```yaml
jobs:
  deploy:
    permissions:
      contents: read
      deployments: write
    uses: drumandbytes/reusable-actions/.github/workflows/deploy-cloudflare-pages.yml@v1
    with:
      project-name: my-site
      working-directory: frontend
      build-env: >-
        {"VITE_API_BASE_URL": "${{ vars.VITE_API_BASE_URL }}"}
    secrets:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### `indexnow.yml`

Fetches `https://<host>/sitemap.xml` (following a sitemap index one level)
and submits every URL to IndexNow, in batches of 10,000 (the API's
per-request limit). Retries the sitemap fetch while a fresh deploy
propagates, warns instead of failing on an empty sitemap, and never fails the
caller's run (`continue-on-error`). The site must serve `<key>.txt` at its
root.

| Input | Required | Default | Description |
|---|---|---|---|
| `host` | yes | — | Hostname, e.g. `eraser.drumandbytes.dev` |
| `key` | yes | — | IndexNow key — pass the org's `INDEXNOW_KEY` variable |
| `runner` | no | `ubuntu-latest` | |

```yaml
jobs:
  deploy:
    # ...
  indexnow:
    needs: deploy
    uses: drumandbytes/reusable-actions/.github/workflows/indexnow.yml@v1
    with:
      host: eraser.drumandbytes.dev
      key: ${{ vars.INDEXNOW_KEY }}
```

### `node-ci.yml`

One root lint job, then one job per package running its check command.

| Input | Required | Default | Description |
|---|---|---|---|
| `packages` | no | `[]` | JSON array of `{"directory", "command", "name"?}`; one job each |
| `run-lint` | no | `true` | Run the lint job |
| `lint-directory` | no | `.` | Where the lint job installs and runs |
| `lint-command` | no | `npm run lint` | |
| `package-manager` | no | `npm` | `npm` or `pnpm` (pnpm installs once from the workspace root); anything else fails the job |
| `node-version` | no | `24` | Fallback Node.js version |
| `runner` | no | `ubuntu-latest` | |

```yaml
jobs:
  ci:
    uses: drumandbytes/reusable-actions/.github/workflows/node-ci.yml@v1
    with:
      packages: >-
        [{"directory": "api-worker", "command": "npm run typecheck && npm test"},
         {"directory": "web", "command": "npm test"}]
```

### `go-ci.yml`

Build, vet, gofmt check and test in one job; golangci-lint and hadolint in
their own.

| Input | Required | Default | Description |
|---|---|---|---|
| `go-version` | no | `""` | Go version; empty reads it from `go.mod`. A patch-level directive there (`go 1.27.0`) installs exactly that patch, so pass e.g. `1.27` to get the latest 1.27.x |
| `test-race` | no | `false` | Run tests with `-race` |
| `run-golangci-lint` | no | `true` | |
| `golangci-lint-version` | no | `latest` | |
| `dockerfile-path` | no | `""` | Dockerfile to hadolint; empty skips the job |

```yaml
jobs:
  ci:
    uses: drumandbytes/reusable-actions/.github/workflows/go-ci.yml@v1
    with:
      test-race: true
      dockerfile-path: Dockerfile
```

### `python-action-ci.yml`

For repositories shipping a GitHub Action implemented in Python: ruff lint and
format check, tests, and a check that `action.yml` (or `action.yaml`) parses
and required files exist.

| Input | Required | Default | Description |
|---|---|---|---|
| `test-dependencies` | yes | — | Space-separated pip requirements, e.g. `pytest pyyaml` |
| `python-version` | no | `3.12` | |
| `ruff-version` | no | `0.16.8` | Pinned so a ruff release can't fail every caller at once; override to match a repo's own pin |
| `lint-paths` | no | `.github/scripts/` | Paths passed to ruff |
| `test-command` | no | `pytest tests/ -v` | |
| `required-files` | no | `action.yml` | Newline-separated paths that must exist |

```yaml
jobs:
  ci:
    uses: drumandbytes/reusable-actions/.github/workflows/python-action-ci.yml@v1
    with:
      test-dependencies: pytest pyyaml
      required-files: |
        action.yml
        .github/scripts/update.py
```

### `opentofu-validate.yml`

Runs `tofu fmt -check -recursive` and `tofu validate` against a root module.
Uses `init -backend=false`, so it needs no credentials and is safe on pull
requests. Providers are cached, keyed on `.terraform.lock.hcl`.

| Input | Required | Default | Description |
|---|---|---|---|
| `working-directory` | no | `.` | Root module directory |
| `tofu-version` | no | `1.12.3` | OpenTofu CLI version |
| `check-format` | no | `true` | Run the recursive format check |
| `runner` | no | `ubuntu-latest` | |

```yaml
jobs:
  validate:
    uses: drumandbytes/reusable-actions/.github/workflows/opentofu-validate.yml@v1

  validate-bootstrap:
    uses: drumandbytes/reusable-actions/.github/workflows/opentofu-validate.yml@v1
    with:
      working-directory: bootstrap/r2-state-backend
      check-format: false
```

### `security-scan.yml`

Trivy scan, in one of two modes:

- **`fs`** (default) scans the checked-out tree for vulnerable dependencies,
  committed secrets and IaC misconfigurations.
- **`image`** builds the Dockerfile locally (not pushed) and scans the image —
  the real risk surface for a container is its base image and OS packages.
  Build layers are cached; only default-branch runs write the cache.

Findings fail the job and print as a table in the log. Results are
deliberately **not** uploaded as SARIF to GitHub code scanning: that requires
GitHub Code Security / Advanced Security on private repositories, which this
org does not pay for. Failing the build gives the same protection with no
billable surface.

| Input | Required | Default | Description |
|---|---|---|---|
| `scan-type` | no | `fs` | `fs` or `image`; anything else fails the job |
| `scan-ref` | no | `.` | fs: path to scan |
| `skip-dirs` | no | `""` | fs: comma-separated directories to exclude |
| `scanners` | no | `vuln,secret,misconfig` | fs: Trivy scanners to run |
| `image-context` | no | `.` | image: build context |
| `dockerfile` | no | `Dockerfile` | image: Dockerfile to build |
| `skip-files` | no | `""` | image: comma-separated in-image paths to exclude |
| `severity` | no | `CRITICAL,HIGH` | Severities that fail the build |
| `ignore-unfixed` | no | `true` | Skip vulnerabilities with no fix available |
| `runner` | no | `ubuntu-latest` | |

```yaml
jobs:
  security:
    uses: drumandbytes/reusable-actions/.github/workflows/security-scan.yml@v1

  image-security:
    uses: drumandbytes/reusable-actions/.github/workflows/security-scan.yml@v1
    with:
      scan-type: image
```

Keep the security scan in a **separate workflow** from CI. Auto-merge gates on
the CI workflow's conclusion, so a scan inside CI means a vulnerability in one
package blocks merging a Dependabot PR that fixes a different one.

### `auto-merge.yml`

Enables auto-merge on a PR once its CI run has passed. Defaults to
**Dependabot only**.

Called from a `workflow_run` trigger, not `pull_request`: GitHub gives
Dependabot-triggered runs a read-only token and no secrets, so a
`pull_request` job cannot merge them. A `workflow_run` job executes in the base
repository's context with full permissions.

It acts only on the PR whose head is the exact commit CI ran against; if the
branch has moved on, the CI run for the new head decides. With
`use-app-token-for-merge`, the app token is scoped to `contents`,
`pull-requests` and `workflows` (Dependabot action bumps edit workflow files).

There is no "approve" step — the org ruleset requires zero approving reviews,
and Actions is blocked from approving PRs org-wide by design.

| Input | Required | Default | Description |
|---|---|---|---|
| `allowed-authors` | no | `["dependabot[bot]"]` | JSON array of authors eligible whatever they change |
| `patch-only-authors` | no | `[]` | JSON array of authors eligible only for a patch bump in `.release-please-manifest.json` — for release-please's PR author |
| `merge-method` | no | `squash` | `squash`, `merge` or `rebase` |
| `use-app-token-for-merge` | no | `false` | Merge with the dnb-robot app token, so a merged release PR triggers the next release-please run (`GITHUB_TOKEN` merges trigger nothing) |
| `runner` | no | `ubuntu-latest` | |

| Secret | Required | Description |
|---|---|---|
| `DNB_ROBOT_CLIENT_ID` | if `use-app-token-for-merge` | dnb-robot app client ID |
| `AUTOMATION_APP_PRIVATE_KEY` | if `use-app-token-for-merge` | dnb-robot app private key |

> Widening `allowed-authors` on a public repository would auto-merge outside
> contributions. Don't.

```yaml
on:
  workflow_run:
    workflows: [CI]
    types: [completed]

jobs:
  auto-merge:
    permissions:        # the caller must grant these; a reusable workflow
      contents: write   # cannot exceed the caller's permissions, and the org
      pull-requests: write  # default for GITHUB_TOKEN is read-only
    # Don't gate on workflow_run.event == 'pull_request': Dependabot pushes a
    # same-repo branch, so its CI runs as 'push' and that gate skips every
    # run. The reusable workflow looks up the PR and checks the author.
    if: github.event.workflow_run.conclusion == 'success'
    uses: drumandbytes/reusable-actions/.github/workflows/auto-merge.yml@v1
```

### `release-please.yml`

Opens and updates a release PR with the version bump and `CHANGELOG.md`, then
tags and publishes a GitHub Release once it is merged. Expects
`release-please-config.json` and `.release-please-manifest.json` in the
calling repo's root. Runs as the dnb-robot app so tag pushes get past the
`protecting-main` ruleset, with the token scoped to `contents`,
`pull-requests` and `issues` (for release-please's labels).

| Input | Required | Default | Description |
|---|---|---|---|
| `move-floating-tags` | no | `false` | Move `vN` / `vN.M` onto each release — for repos consumed as `@v1` |
| `runner` | no | `ubuntu-latest` | |

| Secret | Required | Description |
|---|---|---|
| `DNB_ROBOT_CLIENT_ID` | yes | dnb-robot app client ID |
| `AUTOMATION_APP_PRIVATE_KEY` | yes | dnb-robot app private key |

```yaml
on:
  push:
    branches: [main]

jobs:
  release-please:
    permissions:
      contents: write
      pull-requests: write
    uses: drumandbytes/reusable-actions/.github/workflows/release-please.yml@v1
    secrets:
      DNB_ROBOT_CLIENT_ID: ${{ secrets.DNB_ROBOT_CLIENT_ID }}
      AUTOMATION_APP_PRIVATE_KEY: ${{ secrets.AUTOMATION_APP_PRIVATE_KEY }}
```

## Related

Org infrastructure, including the repository and ruleset configuration that
governs this repo, is managed with OpenTofu in `drumandbytes/dnb-tf`. The
design rationale for this repository is in that repo's
`docs/reusable-workflows.md`.
