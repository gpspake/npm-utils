# npm utils

A library of scripts for analysing package.json files and npm output

## Getting started
### install
npm
```
npm install @spake/npm-utils
```

yarn
```
yarn @spake/npm-utils
```

## Utils

### compare

compares before and after versions of a package.json file to report stats

- total dependencies before
- total dependencies after
- number of dependencies changed (version)
- number of dependencies removed
- number of dependencies added

Usage:
```
npm-utils compare path/to/before-file.json path/to/after-file.json`
```

## Development

npm-utils is built with [Typescript](https://www.typescriptlang.org/) and [yargs](http://yargs.js.org/)

### Developing locally
```
git clone git@github.com:gpspake/npm-utils.git
cd npm-utils
yarn
yarn link
which npm-utils
```

### Adding new commands
To add a new command, create a [yargs command module](https://github.com/yargs/yargs/blob/main/docs/advanced.md#providing-a-command-module) to the `commands` directory and add it to the `commands` array in `commands/index.ts`.
Place any reusable code in the `lib` directory.

Add new ts files to `files` in `tsconfig.json`
