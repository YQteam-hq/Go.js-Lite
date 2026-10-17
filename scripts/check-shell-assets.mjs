import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// The service worker precaches SHELL_ASSETS at install time, and
// cache.addAll rejects the whole install when a single entry 404s. A
// missing file would therefore break offline support silently after
// deployment; this guard turns it into a build failure instead.

const root = dirname(dirname(fileURLToPath(import.meta.url)))

const SW_FILE = 'public/sw.js'
const SHELL_ASSETS_PREFIX = 'const SHELL_ASSETS'
// A single-line string constant in the worker: const NAME = 'value'.
const CONSTANT_PATTERN = /const (\w+) = '([^']+)'/g
// One quoted entry inside the shell list.
const ENTRY_PATTERN = /'([^']*)'/g

const failures = []

function readTextFile(relativePath) {
  try {
    return readFileSync(join(root, relativePath), 'utf8')
  } catch {
    failures.push(`${relativePath}: the file is missing`)
    return ''
  }
}

// Maps every string constant declared in the worker to its literal, so the
// shell list can be read with the identifiers it references resolved.
function readConstants(source) {
  const constants = new Map()
  for (const match of source.matchAll(CONSTANT_PATTERN)) {
    constants.set(match[1], match[2])
  }
  return constants
}

// Returns the shell list with every identifier replaced by its literal, or
// an empty string when the worker declares no list at all.
function readShellList(source, constants) {
  const line = source.split('\n').find((entry) => entry.startsWith(SHELL_ASSETS_PREFIX))
  if (!line) {
    failures.push(`${SW_FILE}: the SHELL_ASSETS list is missing`)
    return ''
  }
  const offlineUrl = constants.get('OFFLINE_URL')
  return offlineUrl ? line.replaceAll('OFFLINE_URL', `'${offlineUrl}'`) : line
}

const swSource = readTextFile(SW_FILE)
const constants = readConstants(swSource)
const offlineUrl = constants.get('OFFLINE_URL')

if (swSource && !offlineUrl) {
  failures.push(`${SW_FILE}: the OFFLINE_URL constant is missing`)
}

const shellList = readShellList(swSource, constants)
if (offlineUrl && shellList && !shellList.includes(`'${offlineUrl}'`)) {
  failures.push(`${SW_FILE}: OFFLINE_URL "${offlineUrl}" is not part of SHELL_ASSETS`)
}

const entries = shellList ? [...shellList.matchAll(ENTRY_PATTERN)].map((match) => match[1]) : []
if (swSource && entries.length === 0) {
  failures.push(`${SW_FILE}: SHELL_ASSETS is empty`)
}

for (const entry of entries) {
  const path = entry.replace(/^\.\//, '')
  // './' and './index.html' are the document at the project root; every
  // other entry is copied from public/.
  const file = path === '' || path === 'index.html' ? 'index.html' : join('public', path)
  if (!existsSync(join(root, file))) {
    failures.push(`${SW_FILE}: SHELL_ASSETS entry "${entry}" has no file at ${file}`)
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    process.stderr.write(`check-shell-assets: ${failure}\n`)
  }
  process.stderr.write(
    `check-shell-assets: ${failures.length} problem(s) found, the install-time shell must exist on disk\n`,
  )
  process.exit(1)
}

process.stdout.write('check-shell-assets: every SHELL_ASSETS entry resolves to a file on disk\n')
