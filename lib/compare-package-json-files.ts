#!/usr/bin/env node
import * as fs from 'fs'

// compares before and after versions of a package.json file to report stats
// total dependencies before
// total dependencies after
// number of dependencies changed
// number of dependencies removed
// number of dependencies added

// data flow
// PackageJsonFile -> EnrichedDependency[] -> AggregateDependencyData -> report

// types
type KeyValue = { [key: string]: string }
type IFrom = 'before' | 'after'
type IDependencyType = 'dependency' | 'devDependency'
type EnrichedDependency = {
  dependency: {
    packageName: string
    version: string
  }
  dependencyType: IDependencyType
  from: IFrom
}
type PackageJsonFile = {
  name: string
  version: string
  repository: string | undefined
  dependencies: KeyValue
  devDependencies: KeyValue
}
type AggregateDependencyData = {
  before: {
    packageName: string
    packageVersion: string
    dependencies: EnrichedDependency[]
    devDependencies: EnrichedDependency[]
  }
  after: {
    packageName: string
    packageVersion: string
    dependencies: EnrichedDependency[]
    devDependencies: EnrichedDependency[]
  }
}

// transform dependency KeyValue objects from package.json to NormalizedDependency objects
const enrichDependencies = (
  dependencies: KeyValue,
  dependencyType: IDependencyType,
  from: IFrom
): EnrichedDependency[] =>
  Object.entries(dependencies).map(dependency => ({
    dependency: {
      packageName: dependency[0],
      version: dependency[1],
    },
    dependencyType,
    from,
  }))

type IGetAggregateDependencyDataArgs = {
  packageJsonBefore: PackageJsonFile
  packageJsonAfter: PackageJsonFile
}

// aggregate enriched data
const getAggregateDependencyData = (
  args: IGetAggregateDependencyDataArgs
): AggregateDependencyData => {
  const { packageJsonBefore, packageJsonAfter } = args
  const aggregateDependencyData = {
    before: {
      packageVersion: packageJsonBefore.version,
      packageName: packageJsonBefore.name,
      dependencies: enrichDependencies(
        packageJsonBefore.dependencies,
        'dependency',
        'before'
      ),
      devDependencies: enrichDependencies(
        packageJsonBefore.devDependencies,
        'devDependency',
        'before'
      ),
    },
    after: {
      packageVersion: packageJsonAfter.version,
      packageName: packageJsonAfter.name,
      dependencies: enrichDependencies(
        packageJsonAfter.dependencies,
        'dependency',
        'after'
      ),
      devDependencies: enrichDependencies(
        packageJsonAfter.devDependencies,
        'devDependency',
        'after'
      ),
    },
  }

  return aggregateDependencyData
}

// generate report based on before and after
const compareDependencies = (
  before: EnrichedDependency[],
  after: EnrichedDependency[]
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

  // const dependencyType = before.length
  const countBefore = before.length
  const countAfter = after.length
  const countChanged = changed.length
  const countRemoved = removed.length
  const countAdded = added.length

  return {
    countBefore,
    countAfter,
    countChanged,
    countRemoved,
    countAdded,
  }
}

// return combined report with total stats based on data
const report = (aggregateDependencyData: AggregateDependencyData) => {
  const { before, after } = aggregateDependencyData
  const versionBefore = before.packageVersion
  const versionAfter = after.packageVersion
  const devDependencies = {
    dependencyType: 'devDependencies',
    versionBefore,
    versionAfter,
    ...compareDependencies(before.devDependencies, after.devDependencies),
  }
  const dependencies = {
    dependencyType: 'dependencies',
    versionBefore,
    versionAfter,
    ...compareDependencies(before.dependencies, after.dependencies),
  }
  const countBefore = devDependencies.countBefore + dependencies.countAfter
  const countAfter = devDependencies.countAfter + dependencies.countAfter
  const countChanged = devDependencies.countChanged + dependencies.countChanged
  const countRemoved = devDependencies.countRemoved + dependencies.countRemoved
  const countAdded = devDependencies.countAdded + dependencies.countAdded

  const total = {
    dependencyType: 'total',
    versionBefore,
    versionAfter,
    countBefore,
    countAfter,
    countChanged,
    countRemoved,
    countAdded,
  }

  return {
    stats: {
      devDependencies,
      dependencies,
      total,
    },
  }
}

export const comparePackageJsonFiles = (
  beforePath: string,
  afterPath: string
) => {
  const packageJsonBefore = JSON.parse(fs.readFileSync(beforePath).toString())
  const packageJsonAfter = JSON.parse(fs.readFileSync(afterPath).toString())
  const aggregateDependencyData = getAggregateDependencyData({
    packageJsonBefore,
    packageJsonAfter,
  })
  return JSON.stringify(report(aggregateDependencyData), null, 4)
}
