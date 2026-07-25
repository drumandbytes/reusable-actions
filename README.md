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
