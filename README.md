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
| `working-directory` | yes | — | Directory holding the worker's wrangler config, `package.json` and `package-lock.json` |
| `node-version` | no | `20` | Node.js version used for install and deploy |

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

## Related

Org infrastructure, including the repository and ruleset configuration that
governs this repo, is managed with OpenTofu in `drumandbytes/dnb-tf`. The
design rationale for this repository is in that repo's
`docs/reusable-workflows.md`.
