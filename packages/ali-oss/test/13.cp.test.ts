import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import { CpOptions } from '../src/index.js'

import { assertUploadFiles } from './helper.js'
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
      assertUploadFiles(ret.data, 1, 0, 1, 0, ret.stderr)
    })

  })
})


