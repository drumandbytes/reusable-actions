# Contributing

## Checks

CI runs two linters over `.github/`; run them locally before pushing:

```sh
actionlint -ignore 'action "\$/[^"]*" in invalid format'   # syntax, expressions, shellcheck
zizmor --offline .                                          # workflow security audit
```

The `-ignore` covers GitHub's `$/` self-repository syntax, which actionlint
1.7.12 doesn't know yet; drop it here and in `ci.yml` once it does.

CI also runs `node-ci`, `opentofu-validate` and `security-scan` (both modes)
against the minimal projects in `tests/fixtures/`, through local `./` paths,
so a PR tests its own version of those workflows. When you change one of
them, check its self-test still covers the change; add to the fixture if not.

Shared steps used by more than one workflow live as composite actions under
`.github/actions/` and are called with `uses: $/.github/actions/<name>`. `$/`
resolves to this repo at the commit the workflow runs from; a `./` path would
point into the caller's checkout instead.

zizmor findings are fixed, not silenced. The exception is behavior that is
intentional (a caller-supplied command, `workflow_run` for Dependabot): mark
it with an inline `# zizmor: ignore[<audit>] -- <reason>` or an entry in
`.github/zizmor.yml`, always with the reason.

Third-party actions are pinned to a full commit SHA with a `# vX.Y.Z` comment
(`uses: owner/action@<sha> # v1.2.3`); Dependabot keeps both up to date.
`actions/*` stays on its major tag. zizmor fails CI on a third-party tag pin.

## Commits and releases

Releases are automated with [release-please](https://github.com/googleapis/release-please).
It reads the commit history on `main`, keeps a rolling **release PR** with the next
version + changelog, and cuts the release (tag, GitHub Release, `CHANGELOG.md`) when
that PR is merged. The floating `v1` / `v1.2` tags are moved automatically.

For this to work, **squash-merge every PR** and give it a
[Conventional Commits](https://www.conventionalcommits.org/) title:

| Prefix | Effect | Example |
| --- | --- | --- |
| `feat:` | minor bump | `feat: add a Rust CI reusable workflow` |
| `fix:` / `perf:` | patch bump | `fix(node-ci): cache the pnpm store` |
| `feat!:` or `BREAKING CHANGE:` in body | major bump | `feat!: drop Node 20 support` |
| `chore:` `docs:` `ci:` `test:` `refactor:` `build:` | no release | `docs: fix a badge link` |

Dependabot is configured to prefix its PRs with `fix(deps):`, so dependency bumps
become patch releases on their own — no action needed beyond the usual auto-merge.

Don't hand-edit `CHANGELOG.md`, version files, or tags — release-please owns them.
