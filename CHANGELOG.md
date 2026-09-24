# Changelog

## [1.16.1](https://github.com/drumandbytes/reusable-actions/compare/v1.16.0...v1.16.1) (2026-09-24)


### Performance Improvements

* skip the Actions npm cache on self-hosted runners ([#41](https://github.com/drumandbytes/reusable-actions/issues/41)) ([d9340fc](https://github.com/drumandbytes/reusable-actions/commit/d9340fcdbff5d7834f4bd524237869260bd20168))

## [1.16.0](https://github.com/drumandbytes/reusable-actions/compare/v1.15.2...v1.16.0) (2026-09-24)


### Features

* self-test the workflows, share the node lookup, fix silent failures ([#39](https://github.com/drumandbytes/reusable-actions/issues/39)) ([c63dc27](https://github.com/drumandbytes/reusable-actions/commit/c63dc27986186203d02ab9e6a35fac74de7bc1be))

## [1.15.2](https://github.com/drumandbytes/reusable-actions/compare/v1.15.1...v1.15.2) (2026-09-24)


### Bug Fixes

* **release-please:** scope the app token to what release-please needs ([#37](https://github.com/drumandbytes/reusable-actions/issues/37)) ([36d96cc](https://github.com/drumandbytes/reusable-actions/commit/36d96cc91010288bed9f5c1426d6122955dc5f90))

## [1.15.1](https://github.com/drumandbytes/reusable-actions/compare/v1.15.0...v1.15.1) (2026-09-24)


### Bug Fixes

* **deps:** bump pnpm/action-setup in the actions group ([#35](https://github.com/drumandbytes/reusable-actions/issues/35)) ([db9feeb](https://github.com/drumandbytes/reusable-actions/commit/db9feeb958e71c37c49dc360d87f1c4c6e4df2c8))

## [1.15.0](https://github.com/drumandbytes/reusable-actions/compare/v1.14.0...v1.15.0) (2026-09-24)


### Features

* harden, fix and speed up the reusable workflows ([#33](https://github.com/drumandbytes/reusable-actions/issues/33)) ([37b592e](https://github.com/drumandbytes/reusable-actions/commit/37b592ee42f623bb31f19dfddcc3748a4f5ebad7))

## [1.14.0](https://github.com/drumandbytes/reusable-actions/compare/v1.13.2...v1.14.0) (2026-09-20)


### Features

* parameterize runner for self-hosted migration ([#30](https://github.com/drumandbytes/reusable-actions/issues/30)) ([c274846](https://github.com/drumandbytes/reusable-actions/commit/c27484659c2ad9fe0039627b53622abb312c1cff))

## [1.13.2](https://github.com/drumandbytes/reusable-actions/compare/v1.13.1...v1.13.2) (2026-09-20)


### Bug Fixes

* stop path-filtering the workflow that hosts the required-check gate ([#28](https://github.com/drumandbytes/reusable-actions/issues/28)) ([809f84e](https://github.com/drumandbytes/reusable-actions/commit/809f84e032bd19a400883db70133e2f5233dc0b3))

## [1.13.1](https://github.com/drumandbytes/reusable-actions/compare/v1.13.0...v1.13.1) (2026-09-19)


### Bug Fixes

* retry the sitemap fetch, it races deploy propagation ([#25](https://github.com/drumandbytes/reusable-actions/issues/25)) ([b8ebd91](https://github.com/drumandbytes/reusable-actions/commit/b8ebd9174d2872a0cbad9be2ae0f13021428702f))

## [1.13.0](https://github.com/drumandbytes/reusable-actions/compare/v1.12.1...v1.13.0) (2026-09-19)


### Features

* add reusable IndexNow submission workflow ([#23](https://github.com/drumandbytes/reusable-actions/issues/23)) ([a006d92](https://github.com/drumandbytes/reusable-actions/commit/a006d920d271e9eb83d11d8e5eea86fc1254a1e0))

## [1.12.1](https://github.com/drumandbytes/reusable-actions/compare/v1.12.0...v1.12.1) (2026-09-19)


### Bug Fixes

* **deps:** bump the actions group with 2 updates ([#20](https://github.com/drumandbytes/reusable-actions/issues/20)) ([dc34cb0](https://github.com/drumandbytes/reusable-actions/commit/dc34cb0ad7aee7d22931689d3222207093b5fe76))

## [1.12.0](https://github.com/drumandbytes/reusable-actions/compare/v1.11.1...v1.12.0) (2026-09-07)


### Features

* read the node version from mise.toml when a caller has one ([#19](https://github.com/drumandbytes/reusable-actions/issues/19)) ([964034c](https://github.com/drumandbytes/reusable-actions/commit/964034c6c420f7e5e3437b10884369fd99dcd626))


### Bug Fixes

* **ci:** opt this repo's own auto-merge caller into use-app-token-for-merge ([1e55f7c](https://github.com/drumandbytes/reusable-actions/commit/1e55f7cf0c274c5304b18343bdd68534df4839c4))

## [1.11.1](https://github.com/drumandbytes/reusable-actions/compare/v1.11.0...v1.11.1) (2026-09-06)


### Bug Fixes

* **auto-merge:** optional app-token merge, so release-please PRs actually cascade ([#16](https://github.com/drumandbytes/reusable-actions/issues/16)) ([98d8f50](https://github.com/drumandbytes/reusable-actions/commit/98d8f50cbd5394b7e799caec20f9f07fb75ff7a5))

## [1.11.0](https://github.com/drumandbytes/reusable-actions/compare/v1.10.2...v1.11.0) (2026-09-04)


### Features

* **ci:** auto-merge patch-level release-please PRs only ([#14](https://github.com/drumandbytes/reusable-actions/issues/14)) ([0dfb2a0](https://github.com/drumandbytes/reusable-actions/commit/0dfb2a0a4c84e4ce436fa336746fed3a20a1724d))
* **ci:** turn release-please.yml into a reusable workflow ([#13](https://github.com/drumandbytes/reusable-actions/issues/13)) ([d3157d5](https://github.com/drumandbytes/reusable-actions/commit/d3157d5f56af411d8324cea372e7c07f26a2694f))

## [1.10.2](https://github.com/drumandbytes/reusable-actions/compare/v1.10.1...v1.10.2) (2026-09-04)


### Bug Fixes

* **ci:** use v5 bare output names for the tag-move step ([#9](https://github.com/drumandbytes/reusable-actions/issues/9)) ([2664908](https://github.com/drumandbytes/reusable-actions/commit/2664908647f2deee4aa2bb1ba4dc4243151040bd))

## [1.10.1](https://github.com/drumandbytes/reusable-actions/compare/v1.10.0...v1.10.1) (2026-09-04)


### Bug Fixes

* **deps:** bump the actions group with 2 updates ([#7](https://github.com/drumandbytes/reusable-actions/issues/7)) ([da52146](https://github.com/drumandbytes/reusable-actions/commit/da5214632e1b29a8fadf0260566a4c9b801a5d9f))
