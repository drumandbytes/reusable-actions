# Test fixtures

Minimal projects that `.github/workflows/ci.yml` runs this repo's reusable
workflows against, through local `uses: ./.github/workflows/…` references, so
a PR is tested with its own version of each workflow rather than the released
`@v1`. They exist only for that; nothing here is shipped.

- `mise.toml` pins Node one level *above* `node/`, so a passing `node-ci` run
  also proves the node-version lookup walks up parent directories.
- `node/` — dependency-free npm package for `node-ci` (lint + check matrix).
- `tofu/` — root module with one provider and a lock file, for
  `opentofu-validate` including its provider cache.
- `image/` — `FROM scratch` image for `security-scan`'s image mode. Built
  from scratch so a newly published CVE in a base image can't turn an
  unrelated PR red.
