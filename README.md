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
npm-utils compare <before> <after> [--csv] [--output-file]

compares before and after versions of a package.json file and reports stats

Positionals:
  before  path to package.json before changes                [string] [required]
  after   path to package.json before changes                [string] [required]

Options:
      --help         Show help                                         [boolean]
      --version      Show version number                               [boolean]
  -c, --csv          output results in csv format                      [boolean]
  -o, --output-file  provide a path to output file                     [boolean]
```

sample default output (json)
```
{
    "stats": {
        "devDependencies": {
            "dependencyType": "devDependencies",
            "versionBefore": "0.0.1",
            "versionAfter": "0.0.1",
            "countBefore": 140,
            "countAfter": 123,
            "countChanged": 49,
            "countRemoved": 22,
            "countAdded": 5
        },
        "dependencies": {
            "dependencyType": "dependencies",
            "versionBefore": "0.0.1",
            "versionAfter": "0.0.1",
            "countBefore": 77,
            "countAfter": 74,
            "countChanged": 20,
            "countRemoved": 3,
            "countAdded": 0
        },
        "total": {
            "dependencyType": "total",
            "versionBefore": "0.0.1",
            "versionAfter": "0.0.1",
            "countBefore": 214,
            "countAfter": 197,
            "countChanged": 69,
            "countRemoved": 25,
            "countAdded": 5
        }
    }
}
```
sample csv output
```
"dependencyType","versionBefore","versionAfter","countBefore","countAfter","countChanged","countRemoved","countAdded"
"devDependencies","0.0.1","0.0.1",140,123,49,22,5
"dependencies","0.0.1","0.0.1",77,74,20,3,0
"total","0.0.1","0.0.1",214,197,69,25,5
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
