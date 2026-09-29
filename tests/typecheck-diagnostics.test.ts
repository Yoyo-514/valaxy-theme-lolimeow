import { describe, expect, it } from 'vitest'
import { filterTypecheckOutput } from '../scripts/typecheck-diagnostics.mjs'

describe('typecheck diagnostics', () => {
  it('keeps source errors whose details mention dependency types', () => {
    const output = 'theme/a.vue(1,2): error TS2322: mismatch\n  import("node_modules/vue").Ref\nnode_modules/x/a.ts(3,4): error TS1234: dependency'
    expect(filterTypecheckOutput(output, 2)).toEqual({
      text: 'theme/a.vue(1,2): error TS2322: mismatch\n  import("node_modules/vue").Ref',
      exitCode: 2,
    })
  })

  it('filters complete dependency blocks with Windows paths and spaces', () => {
    expect(filterTypecheckOutput('C:\\My Project\\node_modules\\a.ts(1,2): error TS1234: mismatch\r\n  details', 2))
      .toEqual({ text: '', exitCode: 0 })
  })

  it('preserves execution failures without diagnostics', () => {
    expect(filterTypecheckOutput('', 1).exitCode).toBe(1)
    expect(filterTypecheckOutput('command failed', 1)).toEqual({ text: 'command failed', exitCode: 1 })
    expect(filterTypecheckOutput('', 0)).toEqual({ text: '', exitCode: 0 })
  })
})
