# yuntools repository

公有云相关工具封装，提供 TypeScript 类型定义

[![GitHub tag](https://img.shields.io/github/tag/waitingsong/yuntools.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/yuntools/workflows/ci/badge.svg)](https://github.com/waitingsong/yuntools/actions?query=workflow%3A%22ci%22)
[![codecov](https://codecov.io/gh/waitingsong/yuntools/branch/main/graph/badge.svg?token=DYPCl7G9U6)](https://codecov.io/gh/waitingsong/yuntools)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)


以下所有命令行操作都在 `git-bash` 窗口中执行






## Packages

| Package     | Version              |
| ----------- | -------------------- |
| [`ali-alb`] | [![alb-svg]][alb-ch] |
| [`ali-ecs`] | [![ecs-svg]][ecs-ch] |
| [`ali-oss`] | [![oss-svg]][oss-ch] |

## Initialize and install dependencies

run it at first time and any time
```sh
npm run repo:init
```


## Compile

Run under root folder
```sh
npm run build
# specify scope
npm run build @scope/demo-docs
# specify scopes
npm run build @scope/demo-docs @scope/demo-serivce
```


## Update package

```sh
npm run bootstrap
```

## Add package

```sh
npm run add:pkg new_module
```

## Test

- Use `npm run lint` to check code style.
- Use `npm run test` to run unit test.

## Clan or Purge

```sh
# clean build dist, cache and build
npm run clean
# clean and remove all node_modules
npm run purge
```

## Note

- Run `npm run clean` before `npm run build`, if any file under typescript outDir folder was deleted manually.
- Default publish registry is `NPM`, configurated in file `lerna.json`
- Any commands above (such as `npm run build`) running in `Git-Bash` under Windows OS

## License
[MIT](LICENSE)


<br>

[`ali-alb`]: https://github.com/waitingsong/yuntools/tree/main/packages/ali-alb
[alb-svg]: https://img.shields.io/npm/v/@yuntools/ali-alb.svg?maxAge=7200
[alb-ch]: https://github.com/waitingsong/yuntools/tree/main/packages/ali-alb/CHANGELOG.md

[`ali-ecs`]: https://github.com/waitingsong/yuntools/tree/main/packages/ali-ecs
[ecs-svg]: https://img.shields.io/npm/v/@yuntools/ali-ecs.svg?maxAge=7200
[ecs-ch]: https://github.com/waitingsong/yuntools/tree/main/packages/ali-ecs/CHANGELOG.md

[`ali-oss`]: https://github.com/waitingsong/yuntools/tree/main/packages/ali-oss
[oss-svg]: https://img.shields.io/npm/v/@yuntools/ali-oss.svg?maxAge=7200
[oss-ch]: https://github.com/waitingsong/yuntools/tree/main/packages/ali-oss/CHANGELOG.md

