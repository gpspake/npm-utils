#!/usr/bin/env node
"use strict";
exports.__esModule = true;
exports.comparePackageJsonFiles = void 0;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
var fs = require("fs");
// transform dependency KeyValue objects from package.json to NormalizedDependency objects
var normalizeDependencies = function (dependencies, dependencyType, from) {
    return Object.entries(dependencies).map(function (dependency) { return ({
        dependency: {
            packageName: dependency[0],
            version: dependency[1]
        },
        dependencyType: dependencyType,
        from: from
    }); });
};
// normalized data
var getNormalizedDependencyData = function (args) {
    var packagesBefore = args.packagesBefore, packagesAfter = args.packagesAfter;
    var normalizedDependencyData = {
        before: {
            dependencies: normalizeDependencies(packagesBefore.dependencies, 'dependency', 'before'),
            devDependencies: normalizeDependencies(packagesBefore.devDependencies, 'devDependency', 'before')
        },
        after: {
            dependencies: normalizeDependencies(packagesAfter.dependencies, 'dependency', 'after'),
            devDependencies: normalizeDependencies(packagesAfter.devDependencies, 'devDependency', 'after')
        }
    };
    return normalizedDependencyData;
};
// generate report based on before and after
var aggregate_dependency_report = function (before, after) {
    var combined = before.map(function (beforeDependency) {
        var afterDependency = after.find(function (ad) {
            return ad.dependency.packageName === beforeDependency.dependency.packageName;
        });
        return afterDependency
            ? [beforeDependency, afterDependency]
            : [beforeDependency];
    });
    var changed = combined.filter(function (dependency) {
        return dependency.length === 2 &&
            dependency[0].dependency.version !== dependency[1].dependency.version;
    });
    var removed = combined.filter(function (aggedDep) { return aggedDep.length === 1; });
    var added = after.filter(function (afterDependency) {
        var beforeDependency = before.find(function (d) { return d.dependency.packageName === afterDependency.dependency.packageName; });
        return !beforeDependency;
    });
    var countBefore = before.length;
    var countAfter = after.length;
    var countChanged = changed.length;
    var countRemoved = removed.length;
    var countAdded = added.length;
    return {
        stats: {
            countBefore: countBefore,
            countAfter: countAfter,
            countChanged: countChanged,
            countRemoved: countRemoved,
            countAdded: countAdded,
            summary: "".concat(countBefore, "->").concat(countAfter, " - ").concat(countChanged, " updated, ").concat(countRemoved, " removed ").concat(countAdded, " added")
        }
    };
};
// return combined report with total stats based on data
var report = function (normalizedDependencyData) {
    var devDependencies = aggregate_dependency_report(normalizedDependencyData.before.devDependencies, normalizedDependencyData.after.devDependencies);
    var dependencies = aggregate_dependency_report(normalizedDependencyData.before.dependencies, normalizedDependencyData.after.dependencies);
    var countBefore = devDependencies.stats.countBefore + dependencies.stats.countAfter;
    var countAfter = devDependencies.stats.countAfter + dependencies.stats.countAfter;
    var countChanged = devDependencies.stats.countChanged + dependencies.stats.countChanged;
    var countRemoved = devDependencies.stats.countRemoved + dependencies.stats.countRemoved;
    var countAdded = devDependencies.stats.countAdded + dependencies.stats.countAdded;
    var total = {
        stats: {
            countBefore: countBefore,
            countAfter: countAfter,
            countChanged: countChanged,
            countRemoved: countRemoved,
            countAdded: countAdded,
            summary: "".concat(countBefore, "->").concat(countAfter, " - ").concat(countChanged, " updated, ").concat(countRemoved, " removed, ").concat(countAdded, " added")
        }
    };
    return {
        devDependencies: devDependencies,
        dependencies: dependencies,
        total: total
    };
};
var comparePackageJsonFiles = function (beforePath, afterPath) {
    // read json files
    var packageJsonAfter = fs.readFileSync(afterPath);
    var packageJsonBefore = fs.readFileSync(beforePath);
    // parse json
    var packagesAfter = JSON.parse(packageJsonAfter.toString());
    var packagesBefore = JSON.parse(packageJsonBefore.toString());
    var normalizedDependencyData = getNormalizedDependencyData({
        packagesBefore: packagesBefore,
        packagesAfter: packagesAfter
    });
    console.log(JSON.stringify(report(normalizedDependencyData), null, 4));
};
exports.comparePackageJsonFiles = comparePackageJsonFiles;
