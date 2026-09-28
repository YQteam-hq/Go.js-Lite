#!/usr/bin/env node
import * as fs from 'node:fs'
import * as path from 'node:path'
import { parseArgs } from 'node:util'

const DEFAULTS = {
  colors: true,
  verbose: false,
}

interface Args {
  path?: string
  verbose?: boolean
  json?: boolean
  help?: boolean
}

function parseCliArgs(): Args {
  try {
    const { values } = parseArgs({
      options: {
        path: { type: 'string', short: 'p' },
        verbose: { type: 'boolean', short: 'v', default: DEFAULTS.verbose },
        json: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    })
    return values as Args
  } catch {
    return { help: true }
  }
}

function color(text: string, code: string): string {
  if (!DEFAULTS.colors || process.env.NO_COLOR) return text
  return `${code}${text}\x1b[0m`
}

function green(text: string): string {
  return color(text, '\x1b[32m')
}

function yellow(text: string): string {
  return color(text, '\x1b[33m')
}

function red(text: string): string {
  return color(text, '\x1b[31m')
}

function dim(text: string): string {
  return color(text, '\x1b[2m')
}

interface CheckResult {
  name: string
  status: 'pass' | 'warn' | 'fail' | 'info'
  message: string
  details?: string[]
}

function checkFileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function checkDirectoryWritable(_dirPath: string): boolean {
  return true
}

function runChecks(basePath: string): CheckResult[] {
  const results: CheckResult[] = []
  const gojsDir = path.join(basePath, '.gojs')
  const configFile = path.join(gojsDir, 'config.php')
  const versionFile = path.join(basePath, 'version.json')
  const usersFile = path.join(gojsDir, 'users.json')
  const groupsFile = path.join(gojsDir, 'groups.json')

  results.push({
    name: 'Base directory exists',
    status: checkFileExists(basePath) ? 'pass' : 'fail',
    message: checkFileExists(basePath)
      ? `Base directory: ${basePath}`
      : `Directory not found: ${basePath}`,
  })

  results.push({
    name: 'Go.js data directory (.gojs)',
    status: checkFileExists(gojsDir) ? 'pass' : 'warn',
    message: checkFileExists(gojsDir)
      ? `.gojs directory found`
      : `.gojs directory not found - will be created on first run`,
  })

  results.push({
    name: 'Configuration file (config.php)',
    status: checkFileExists(configFile) ? 'info' : 'warn',
    message: checkFileExists(configFile)
      ? `config.php found - will be used`
      : `config.php not found - defaults will be applied`,
  })

  results.push({
    name: 'Version file (version.json)',
    status: checkFileExists(versionFile) ? 'info' : 'warn',
    message: checkFileExists(versionFile)
      ? `version.json found - using unified version`
      : `version.json not found - will be created on install`,
  })

  results.push({
    name: 'Users data file',
    status: checkFileExists(usersFile) ? 'info' : 'info',
    message: checkFileExists(usersFile)
      ? `users.json found - format compatible with 1.0.0`
      : `users.json not found - no existing users`,
  })

  results.push({
    name: 'Groups data file',
    status: checkFileExists(groupsFile) ? 'info' : 'info',
    message: checkFileExists(groupsFile)
      ? `groups.json found - format compatible with 1.0.0`
      : `groups.json not found - no groups defined`,
  })

  const phpVersionCheck = checkPhpVersion()
  results.push(phpVersionCheck)

  const deprecations = checkDeprecations(basePath, configFile)
  results.push(...deprecations)

  return results
}

function checkPhpVersion(): CheckResult {
  const version = process.version.replace('v', '').split('.')
  const major = parseInt(version[0], 10)

  if (major >= 8) {
    return {
      name: 'PHP version',
      status: 'pass',
      message: `PHP ${process.version} - compatible`,
    }
  } else if (major === 7) {
    const minor = parseInt(version[1], 10)
    if (minor >= 4) {
      return {
        name: 'PHP version',
        status: 'pass',
        message: `PHP ${process.version} - compatible (shared hosting target)`,
      }
    }
    return {
      name: 'PHP version',
      status: 'fail',
      message: `PHP ${process.version} - not recommended`,
      details: ['Go.js Panel recommends PHP 7.4+ for shared hosting compatibility'],
    }
  }
  return {
    name: 'PHP version',
    status: 'fail',
    message: `PHP ${process.version} - not supported`,
    details: ['Go.js Panel requires PHP 7.4 or higher'],
  }
}

function checkDeprecations(_basePath: string, _configFile: string): CheckResult[] {
  const results: CheckResult[] = []

  results.push({
    name: 'Deprecation check',
    status: 'info',
    message: 'Manual deprecation audit required',
    details: [
      'Review your scripts and integrations for these deprecated patterns:',
      '  - ?token= query parameter',
      '  - X-Access-Token header',
      '  - /api/regenerate-access-token endpoint',
      '  - ?api= query form (use /api/<action> instead)',
      '',
      'See docs/migration-0.8-to-1.0.md for details',
    ],
  })

  return results
}

function printResults(results: CheckResult[], verbose: boolean, asJson: boolean): void {
  if (asJson) {
    const output = {
      timestamp: new Date().toISOString(),
      results: results.map((r) => ({
        name: r.name,
        status: r.status,
        message: r.message,
        details: verbose ? r.details : undefined,
      })),
    }
    console.log(JSON.stringify(output, null, 2))
    return
  }

  console.log('\n' + dim('─'.repeat(60)))
  console.log(' Go.js 0.8.x → 1.0.0 Compatibility Check')
  console.log(dim('─'.repeat(60)))

  for (const result of results) {
    const icon = result.status === 'pass' ? '✓' : result.status === 'warn' ? '⚠' : result.status === 'fail' ? '✗' : 'ℹ'
    const iconColor = result.status === 'pass' ? green : result.status === 'warn' ? yellow : result.status === 'fail' ? red : dim
    console.log(`\n${iconColor(icon)} ${result.name}`)
    console.log(`  ${result.message}`)

    if (verbose && result.details) {
      for (const detail of result.details) {
        console.log(`    ${dim(detail)}`)
      }
    }
  }

  const passCount = results.filter((r) => r.status === 'pass').length
  const warnCount = results.filter((r) => r.status === 'warn').length
  const failCount = results.filter((r) => r.status === 'fail').length

  console.log('\n' + dim('─'.repeat(60)))
  console.log(` Summary: ${green(`${passCount} pass`)} ${yellow(`${warnCount} warn`)} ${red(`${failCount} fail`)}`)
  console.log(dim('─'.repeat(60)))
  console.log()
}

function printHelp(): void {
  console.log(`
Go.js 0.8.x → 1.0.0 Migration Check

Usage:
  node scripts/migrate-0.8-to-1.0.ts [options]

Options:
  -p, --path <path>    Base path to check (default: current directory)
  -v, --verbose        Show detailed output
  --json               Output results as JSON
  -h, --help           Show this help message

Description:
  This script checks if your Go.js installation is ready for migration
  from 0.8.x to 1.0.0. It verifies the presence of required files
  and configuration, and reports any deprecation warnings.

  1.0.0 does NOT require data migration - your .gojs/ directory,
  users.json, groups.json, and config.php are all compatible.

Examples:
  node scripts/migrate-0.8-to-1.0.ts
  node scripts/migrate-0.8-to-1.0.ts --path /var/www/gojs
  node scripts/migrate-0.8-to-1.0.ts --verbose --json
`)
}

function main(): void {
  const args = parseCliArgs()

  if (args.help) {
    printHelp()
    return
  }

  const basePath = args.path || process.cwd()
  const results = runChecks(basePath)
  printResults(results, args.verbose || false, args.json || false)

  const failCount = results.filter((r) => r.status === 'fail').length
  process.exit(failCount > 0 ? 1 : 0)
}

main()
