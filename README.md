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

### `deploy-cloudflare-worker.yml`

Builds and deploys an npm-based Cloudflare Worker that lives in a subdirectory
of the calling repository.

**Inputs**

| Name | Required | Default | Description |
|---|---|---|---|
| `working-directory` | yes | — | Directory holding the worker's wrangler config and `package.json` |
| `node-version` | no | `20` | Node.js version used for install and deploy |
| `install-dependencies` | no | `true` | Run `npm ci` first. Set `false` for workers with no `package-lock.json` — `npm ci` hard-fails without one |

**Secrets**

| Name | Required | Description |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | yes | Cloudflare API token with Workers deploy permission |
| `CLOUDFLARE_ACCOUNT_ID` | yes | Cloudflare account ID |

**Usage**

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

Note that the `paths` filter stays in the caller — a reusable workflow cannot
define its own triggers.

### `security-scan.yml`

Trivy scan covering dependency vulnerabilities, committed secrets, and IaC
misconfigurations in one pass. Findings fail the job and print as a table in
the log.

Results are deliberately **not** uploaded as SARIF to GitHub code scanning:
that requires GitHub Code Security / Advanced Security on private
repositories, which this org does not pay for. Failing the build gives the
same protection with no billable surface, and behaves the same way on public
and private repos.

**Inputs**

| Name | Required | Default | Description |
|---|---|---|---|
| `scan-ref` | no | `.` | Path to scan, relative to repo root |
| `scanners` | no | `vuln,secret,misconfig` | Which Trivy scanners to run |
| `severity` | no | `CRITICAL,HIGH` | Severities that fail the build |
| `ignore-unfixed` | no | `true` | Skip vulnerabilities with no fix available |
| `skip-dirs` | no | `""` | Comma-separated directories to exclude |

```yaml
jobs:
  security:
    uses: drumandbytes/reusable-actions/.github/workflows/security-scan.yml@v1
```

### `deploy-cloudflare-pages.yml`

Builds and deploys a Cloudflare Pages site. Defaults target a Vite-style app
(npm install, build to `dist/`), so a typical caller passes only
`project-name`.

**Inputs**

| Name | Required | Default | Description |
|---|---|---|---|
| `project-name` | yes | — | Cloudflare Pages project to deploy to |
| `working-directory` | no | `.` | Directory containing the site |
| `install-dependencies` | no | `true` | Run `npm ci` first; `false` for static sites with no lockfile |
| `build-command` | no | `npm run build` | Command run before deploy; empty string deploys sources as-is |
| `output-directory` | no | `dist` | Directory wrangler publishes, relative to `working-directory` |
| `node-version` | no | `20` | Node.js version |
| `build-env` | no | `{}` | JSON object of build-time env vars, e.g. Vite `VITE_*` values |

Callers must grant `deployments: write` so wrangler can record a GitHub
Deployment — a reusable workflow cannot elevate the caller's permissions.

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

### `auto-merge.yml`

Enables auto-merge on a PR once its CI run has passed. Defaults to
**Dependabot only**.

Called from a `workflow_run` trigger, not `pull_request`: GitHub gives
Dependabot-triggered runs a read-only token and no secrets, so a
`pull_request` job cannot merge them. A `workflow_run` job executes in the base
repository's context with full permissions.

There is no "approve" step — the org ruleset requires zero approving reviews,
and Actions is blocked from approving PRs org-wide by design.

**Inputs**

| Name | Required | Default | Description |
|---|---|---|---|
| `allowed-authors` | no | `["dependabot[bot]"]` | JSON array of eligible PR authors |
| `merge-method` | no | `squash` | `squash`, `merge` or `rebase` |

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
    if: >
      github.event.workflow_run.event == 'pull_request' &&
      github.event.workflow_run.conclusion == 'success'
    uses: drumandbytes/reusable-actions/.github/workflows/auto-merge.yml@v1
```

Keep the security scan in a **separate workflow** from CI. Auto-merge gates on
the CI workflow's conclusion, so a scan inside CI means a vulnerability in one
package blocks merging a Dependabot PR that fixes a different one.

### `opentofu-validate.yml`

Runs `tofu fmt -check -recursive` and `tofu validate` against a root module.
Uses `init -backend=false`, so it needs no credentials and is safe on pull
requests.

**Inputs**

| Name | Required | Default | Description |
|---|---|---|---|
| `working-directory` | no | `.` | Root module directory |
| `tofu-version` | no | `1.12.3` | OpenTofu CLI version |
| `check-format` | no | `true` | Run the recursive format check |

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

## Related

Org infrastructure, including the repository and ruleset configuration that
governs this repo, is managed with OpenTofu in `drumandbytes/dnb-tf`. The
design rationale for this repository is in that repo's
`docs/reusable-workflows.md`.
