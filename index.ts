import * as fs from 'fs'

// compares before and after versions of a package.json file to report stats
// total dependencies before
// total dependencies after
// number of dependencies changed
// number of dependencies removed
// number of dependencies added

// validate args
if (process.argv.slice(2).length !== 2) {
  console.error(
    `usage: compare-package-json-files.js before-file.json after-file.json`
  )
  process.exit()
}

// parse args
const [beforePath, afterPath] = process.argv.slice(2)

// read json files
const packageJsonAfter = fs.readFileSync(afterPath)
const packageJsonBefore = fs.readFileSync(beforePath)

// parse json
const packagesAfter = JSON.parse(packageJsonAfter.toString())
const packagesBefore = JSON.parse(packageJsonBefore.toString())

// types
type KeyValue = { [key: string]: string }
type IFrom = 'before' | 'after'
type IDependencyType = 'dependency' | 'devDependency'
type NormalizedDependency = {
  dependency: {
    packageName: string
    version: string
  }
  dependencyType: IDependencyType
  from: IFrom
}
type NormalizedDependencies = {
  dependencies: NormalizedDependency[]
  devDependencies: NormalizedDependency[]
}
type NormalizedDependencyData = {
  before: NormalizedDependencies
  after: NormalizedDependencies
}

// transform dependency KeyValue objects from package.json to NormalizedDependency objects
const normalizeDependencies = (
  dependencies: KeyValue,
  dependencyType: IDependencyType,
  from: IFrom
): NormalizedDependency[] =>
  Object.entries(dependencies).map(dependency => ({
    dependency: {
      packageName: dependency[0],
      version: dependency[1],
    },
    dependencyType,
    from,
  }))

// normalized data
const normalizedDependencyData: NormalizedDependencyData = {
  before: {
    dependencies: normalizeDependencies(
      packagesBefore.dependencies,
      'dependency',
      'before'
    ),
    devDependencies: normalizeDependencies(
      packagesBefore.devDependencies,
      'devDependency',
      'before'
    ),
  },
  after: {
    dependencies: normalizeDependencies(
      packagesAfter.dependencies,
      'dependency',
      'after'
    ),
    devDependencies: normalizeDependencies(
      packagesAfter.devDependencies,
      'devDependency',
      'after'
    ),
  },
}

// generate report based on before and after
const aggregate_dependency_report = (
  before: NormalizedDependency[],
  after: NormalizedDependency[]
) => {
  const combined = before.map(beforeDependency => {
    const afterDependency = after.find(
      ad =>
        ad.dependency.packageName === beforeDependency.dependency.packageName
    )
    return afterDependency
      ? [beforeDependency, afterDependency]
      : [beforeDependency]
  })

  const changed = combined.filter(
    dependency =>
      dependency.length === 2 &&
      dependency[0].dependency.version !== dependency[1].dependency.version
  )
  const removed = combined.filter(aggedDep => aggedDep.length === 1)
  const added = after.filter(afterDependency => {
    const beforeDependency = before.find(
      d => d.dependency.packageName === afterDependency.dependency.packageName
    )
    return !beforeDependency
  })

  const countBefore = before.length
  const countAfter = after.length
  const countChanged = changed.length
  const countRemoved = removed.length
  const countAdded = added.length

  return {
    stats: {
      countBefore,
      countAfter,
      countChanged,
      countRemoved,
      countAdded,
      summary: `${countBefore}->${countAfter} - ${countChanged} updated, ${countRemoved} removed ${countAdded} added`,
    },
  }
}

// return combined report with total stats based on data
const report = () => {
  const devDependencies = aggregate_dependency_report(
    normalizedDependencyData.before.devDependencies,
    normalizedDependencyData.after.devDependencies
  )
  const dependencies = aggregate_dependency_report(
    normalizedDependencyData.before.dependencies,
    normalizedDependencyData.after.dependencies
  )

  const countBefore =
    devDependencies.stats.countBefore + dependencies.stats.countAfter
  const countAfter =
    devDependencies.stats.countAfter + dependencies.stats.countAfter
  const countChanged =
    devDependencies.stats.countChanged + dependencies.stats.countChanged
  const countRemoved =
    devDependencies.stats.countRemoved + dependencies.stats.countRemoved
  const countAdded =
    devDependencies.stats.countAdded + dependencies.stats.countAdded

  const total = {
    stats: {
      countBefore,
      countAfter,
      countChanged,
      countRemoved,
      countAdded,
      summary: `${countBefore}->${countAfter} - ${countChanged} updated, ${countRemoved} removed, ${countAdded} added`,
    },
  }

  return {
    devDependencies,
    dependencies,
    total,
  }
}

console.log(JSON.stringify(report(), null, 4))
