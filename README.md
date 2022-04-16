#npm utils

A library of scripts for analysing package.json files and npm output

## Utils

### compare package.json files

compares before and after versions of a package.json file to report stats

- total dependencies before
- total dependencies after
- number of dependencies changed (version)
- number of dependencies removed
- number of dependencies added

Usage:
```
compare-package-json-files.js path/to/before-file.json path/to/after-file.json`
```
