import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath } from '@waiting/shared-core'

import {
  cloudUrlPrefix,
  client,
  CI,
  bucket,
  src,
} from './root.config.js'

import type { CpOptions, StatOptions } from '~/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('stat should work', () => {
    it('normal', async () => {
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: CpOptions = {
        bucket,
        src,
        target,
      }
      await client.cp(opts)

      const opts2: StatOptions = {
        bucket,
        target,
      }
      const ret = await client.stat(opts2)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      const { data } = ret
      assert(data.ACL === 'default')
      assert(typeof data['Content-Length'] === 'number')
      assert(data['Content-Length'] > 0)
      assert(data['Content-Md5'])
      assert(data['Content-Md5'].length === 24, data['Content-Md5'])
      assert(data['Content-Type']?.includes('json'))
    })
  })

})


