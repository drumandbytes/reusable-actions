# CLAUDE.md

## What this is

Shared reusable GitHub Actions workflows for the drumandbytes org, called via
`workflow_call`. Public out of necessity, not preference: a public caller repo
can't invoke a reusable workflow hosted in a private one, and several org
repos are public. Nothing sensitive lives here — every workflow takes
repo-specific values (directories, project names, account IDs) as inputs or
secrets supplied by the caller. See README.md for usage examples.

## Reusable workflows

**README.md's table is stale.** It documents 5 of the 10 `workflow_call`
workflows below (missing `go-ci`, `node-ci`, `python-action-ci`, `indexnow`,
`release-please`), and `security-scan.yml` has grown `scan-type`,
`image-context`, `dockerfile`, `skip-files` beyond what's written there. When
a caller's needs don't match the README, read the `on: workflow_call:` block
in the `.yml` itself.

| Workflow | Required inputs | Required secrets |
|---|---|---|
| `deploy-cloudflare-worker.yml` | `working-directory` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |
| `deploy-cloudflare-pages.yml` | `project-name` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |
| `security-scan.yml` | none (`scan-type: fs\|image` switches the rest of the input set) | — |
| `opentofu-validate.yml` | none | — |
| `auto-merge.yml` | none | `DNB_ROBOT_CLIENT_ID` + `AUTOMATION_APP_PRIVATE_KEY`, only if `use-app-token-for-merge: true` |
| `go-ci.yml` | `go-version` | — |
| `node-ci.yml` | none | — |
| `python-action-ci.yml` | `test-dependencies` | — |
| `indexnow.yml` | `host`, `key` | — |
| `release-please.yml` | none | `DNB_ROBOT_CLIENT_ID`, `AUTOMATION_APP_PRIVATE_KEY` |

`ci.yml`, `dependabot-auto-merge.yml`, `self-release-please.yml` are this
repo's own CI/release plumbing — no `workflow_call` trigger, not meant for
callers.

## Versioning

Callers pin to the floating major tag: `...@v1`. The tag moves forward with
backwards-compatible changes; a breaking change gets a new major tag rather
than a rewrite of an existing one. Squash-merge PRs with a Conventional
Commits title — release-please reads that history to cut releases and move
the floating tags.
