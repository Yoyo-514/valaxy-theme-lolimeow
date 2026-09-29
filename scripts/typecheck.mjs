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

const DIAGNOSTIC = /^(.+?)\(\d+,\d+\):\s+error\s+TS\d+:/

/** 仅过滤起始文件位于依赖目录的诊断，保留主题错误中的依赖类型详情。 */
function filterTypecheckOutput(output, exitCode) {
  const blocks = []
  let current = { dependency: false, lines: [] }
  let diagnosticCount = 0

  for (const line of output.split(/\r?\n/)) {
    const match = DIAGNOSTIC.exec(line)
    if (match) {
      blocks.push(current)
      diagnosticCount += 1
      current = { dependency: /(?:^|[\\/])node_modules[\\/]/.test(match[1]), lines: [] }
    }
    current.lines.push(line)
  }
  blocks.push(current)

  const text = blocks.filter(block => !block.dependency).flatMap(block => block.lines).join('\n').trim()
  return { text, exitCode: !text && diagnosticCount > 0 ? 0 : exitCode }
}

const result = filterTypecheckOutput(output, exitCode)
if (result.text)
  process.stdout.write(`${result.text}\n`)
process.exit(result.exitCode)
