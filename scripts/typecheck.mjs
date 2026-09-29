import { execSync } from 'node:child_process'
import process from 'node:process'
import { filterTypecheckOutput } from './typecheck-diagnostics.mjs'

let output = ''
let exitCode = 0

try {
  output = execSync('pnpm exec vue-tsc --noEmit --skipLibCheck --pretty false', {
    encoding: 'utf8',
    stdio: 'pipe',
  })
}
catch (error) {
  output = `${error.stdout || ''}${error.stderr || ''}`
  exitCode = error.status ?? 1
}

const result = filterTypecheckOutput(output, exitCode)
if (result.text)
  process.stdout.write(`${result.text}\n`)
process.exit(result.exitCode)
