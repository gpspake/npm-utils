import * as fs from 'fs';

const packageJsonAfter = fs.readFileSync('compare/package.json');
const packageJsonBefore = fs.readFileSync('compare/package-json-old.json');

const packagesAfter = JSON.parse(packageJsonAfter.toString());
const packagesBefore = JSON.parse(packageJsonBefore.toString());

const normalizeDependencies = (dependencies, dependencyType: 'dependency'|'devDependency', from: 'before'|'after') => (
  Object.entries(dependencies).map((dependency) => {
    return (
      {
        dependency: {
          packageName: dependency[0],
          version: dependency[1],
        },
        dependencyType,
        from,
      }
    )
  })
)

const report = {
  before: {
    dependencies: normalizeDependencies(packagesBefore.dependencies, 'dependency', 'before'),
    devDependencies: normalizeDependencies(packagesBefore.devDependencies, 'devDependency', 'before'),
  },
  after: {
    dependencies: normalizeDependencies(packagesAfter.dependencies, 'dependency', 'after'),
    devDependencies: normalizeDependencies(packagesAfter.devDependencies, 'devDependency', 'after'),
  }
};

console.log(JSON.stringify(report, null, 4))