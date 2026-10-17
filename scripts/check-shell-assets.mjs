import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// The service worker precaches SHELL_ASSETS at install time, and
// cache.addAll rejects the whole install when a single entry 404s. A
// missing file would therefore break offline support silently after
// deployment; this guard turns it into a build failure instead.

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const failures = []

let swSource = ''
try {
  swSource = readFileSync(join(root, 'public/sw.js'), 'utf8')
} catch {
  failures.push('public/sw.js: the service worker source is missing')
}

const readConstant = (name) => {
  const match = swSource.match(new RegExp(`const ${name} = '([^']+)'`))
  return match ? match[1] : null
}

const shellLine = swSource.split('\n').find((line) => line.startsWith('const SHELL_ASSETS'))
if (swSource && !shellLine) {
  failures.push('public/sw.js: the SHELL_ASSETS list is missing')
}

const offlineUrl = readConstant('OFFLINE_URL')
if (offlineUrl && shellLine && !shellLine.includes(offlineUrl) && !shellLine.includes('OFFLINE_URL')) {
  failures.push(`public/sw.js: OFFLINE_URL "${offlineUrl}" is not part of SHELL_ASSETS`)
}

// The shell list references OFFLINE_URL by name, so resolve the identifier
// to its literal before reading the quoted entries.
const resolvedLine = offlineUrl ? shellLine.replaceAll('OFFLINE_URL', `'${offlineUrl}'`) : shellLine
const entries = resolvedLine ? [...resolvedLine.matchAll(/'([^']*)'/g)].map((m) => m[1]) : []
if (entries.length === 0) {
  failures.push('public/sw.js: SHELL_ASSETS is empty')
}

for (const entry of entries) {
  const path = entry.replace(/^\.\//, '')
  // './' and './index.html' are the document at the project root; every
  // other entry is copied from public/.
  const file = path === '' || path === 'index.html' ? 'index.html' : join('public', path)
  if (!existsSync(join(root, file))) {
    failures.push(`public/sw.js: SHELL_ASSETS entry "${entry}" has no file at ${file}`)
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
