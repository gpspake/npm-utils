import { comparePackageJsonFiles } from '../lib/compare-package-json-files'

exports.command = 'compare <before> <after>'

exports.describe =
  'compares before and after versions of a package.json file and reports stats'

exports.handler = function (argv) {
  console.log('running')
  return comparePackageJsonFiles(argv.before, argv.after)
}
