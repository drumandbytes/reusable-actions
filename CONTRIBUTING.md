# Contributing

## Checks

CI runs two linters over `.github/`; run them locally before pushing:

```sh
actionlint                  # workflow syntax, expressions, shellcheck on run: blocks
zizmor --offline .          # workflow security audit
```

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
