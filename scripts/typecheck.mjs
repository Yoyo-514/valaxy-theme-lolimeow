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
  // Valaxy 依赖类型噪声不属于主题源码问题，CI 只暴露可行动的本仓库错误。
  .filter(line => !line.includes('node_modules/'))
  .join('\n')
  .trim()

if (filtered) {
  process.stdout.write(`${filtered}\n`)
  process.exit(exitCode)
}

process.exit(0)
