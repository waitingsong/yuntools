import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import { CpOptions } from '../src/index.js'

import {
  cloudUrlPrefix,
  client,
  client2,
  CI,
  bucket,
  src,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('cp should work', () => {
    it('normal', async () => {
      assert(client2, 'client2 should be defined')

      const target = `${cloudUrlPrefix}/cp-${Date.now().toString()}-tsconfig.json`

      const opts: CpOptions = {
        bucket,
        src,
        target,
      }
      const ret = await client2.cp(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `cp ${src} ${target} failed, ${ret.stderr}`)

      const { data } = ret
      assert(data)
      assert(typeof data.elapsed === 'string', ret.stderr)
      assert(typeof data.averageSpeed === 'number', ret.stderr)
      assert(typeof data.succeedTotalNumber === 'number', ret.stderr)
      assert(data.succeedTotalNumber === 1, ret.stderr)
      assert(typeof data.succeedTotalSize === 'string', ret.stderr)
      assert(data.succeedTotalSize.length, ret.stderr)
      assert(typeof data.uploadDirs === 'undefined', ret.stderr)
      assert(data.uploadFiles === 1)
    })

  })
})


