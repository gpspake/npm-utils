"use strict";
exports.__esModule = true;
var compare_package_json_files_1 = require("./compare-package-json-files");
// https://github.com/yargs/yargs/blob/main/docs/advanced.md#providing-a-command-module
exports.command = 'compare <before> <after>';
exports.describe =
    'compares before and after versions of a package.json file and reports stats';
exports.handler = function (argv) {
    console.log('running');
    return (0, compare_package_json_files_1.comparePackageJsonFiles)(argv.before, argv.after);
};
