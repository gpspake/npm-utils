import { comparePackageJsonFiles } from '../lib/compare-package-json-files'
import { parse } from 'json2csv'
import * as fs from 'fs'

exports.command = 'compare <before> <after>'

exports.describe =
  'compares before and after versions of a package.json file and reports stats'

exports.builder = yargs => {
  yargs
    .positional('before', {
      type: 'string',
      describe: 'path to package.json before changes',
    })
    .positional('after', {
      type: 'string',
      describe: 'path to package.json before changes',
    })
    .option('c', {
      alias: 'csv',
      describe: 'output results in csv format',
      type: 'boolean',
    })
    .option('o', {
      alias: 'output-file',
      describe: 'provide a path to output file',
      type: 'boolean',
    })
}

exports.handler = function (argv) {
  const report = comparePackageJsonFiles(argv.before, argv.after)
  const _csv = Object.prototype.hasOwnProperty.call(argv, 'csv')

  let output = report

  if (_csv) {
    try {
      const { stats } = JSON.parse(report)
      const csv = parse([
        stats.devDependencies,
        stats.dependencies,
        stats.total,
      ])
      output = csv
    } catch (err) {
      console.error(err)
    }
  }

  // output results
  if (argv.outputFile) {
    // write output to file
    fs.writeFile(argv.outputFile, output, err => {
      if (err) {
        console.error(err)
        return
      }
    })
  } else {
    // log output
    console.log(output)
  }
}
