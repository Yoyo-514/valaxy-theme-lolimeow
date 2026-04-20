import { execSync } from 'node:child_process'
import process from 'node:process'

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

const filtered = output
  .split(/\r?\n/)
  .filter(line => !line.includes('node_modules/'))
  .join('\n')
  .trim()

if (filtered) {
  process.stdout.write(`${filtered}\n`)
  process.exit(exitCode)
}

process.exit(0)
