# CLAUDE.md

## What this is

Shared reusable GitHub Actions workflows for the drumandbytes org, called via
`workflow_call`. Public out of necessity, not preference: a public caller repo
can't invoke a reusable workflow hosted in a private one, and several org
repos are public. Nothing sensitive lives here — every workflow takes
repo-specific values (directories, project names, account IDs) as inputs or
secrets supplied by the caller. See README.md for usage examples.

## Reusable workflows

README.md documents every `workflow_call` workflow below with inputs and a
usage example. When changing a workflow's inputs, update its README section
in the same PR; the `on: workflow_call:` block in the `.yml` is the source of
truth if the two ever disagree.

| Workflow | Required inputs | Required secrets |
|---|---|---|
| `deploy-cloudflare-worker.yml` | `working-directory` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |
| `deploy-cloudflare-pages.yml` | `project-name` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |
| `security-scan.yml` | none (`scan-type: fs\|image` switches the rest of the input set) | — |
| `opentofu-validate.yml` | none | — |
| `auto-merge.yml` | none | `DNB_ROBOT_CLIENT_ID` + `AUTOMATION_APP_PRIVATE_KEY`, only if `use-app-token-for-merge: true` |
| `go-ci.yml` | none (`go-version` falls back to `go.mod`) | — |
| `node-ci.yml` | none | — |
| `python-action-ci.yml` | `test-dependencies` | — |
| `indexnow.yml` | `host`, `key` | — |
| `release-please.yml` | none | `DNB_ROBOT_CLIENT_ID`, `AUTOMATION_APP_PRIVATE_KEY` |

`ci.yml`, `dependabot-auto-merge.yml`, `self-release-please.yml` are this
repo's own CI/release plumbing — no `workflow_call` trigger, not meant for
callers. `ci.yml` runs actionlint and zizmor; accepted zizmor findings live in
`.github/zizmor.yml` (or inline `# zizmor: ignore[...]`) with a reason each.

## Action pinning

Third-party actions are SHA-pinned with a `# vX.Y.Z` comment; `actions/*`
stays on major tags. Dependabot bumps both forms (7-day cooldown). zizmor's
`unpinned-uses` policy enforces this, so a new third-party `uses:` on a tag
fails CI.

## Versioning

Callers pin to the floating major tag: `...@v1`. The tag moves forward with
backwards-compatible changes; a breaking change gets a new major tag rather
than a rewrite of an existing one. Squash-merge PRs with a Conventional
Commits title — release-please reads that history to cut releases and move
the floating tags.
