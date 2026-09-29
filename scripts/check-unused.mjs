import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// OXC raw transfer 在 Windows 上预留大块内存；使用其官方开关切回标准解析。
const cli = fileURLToPath(new URL('./cli.js', import.meta.resolve('knip')))
const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
  env: { ...process.env, KNIP_DISABLE_RAW_TRANSFER: '1' },
  stdio: 'inherit',
})
process.exit(result.status ?? 1)
