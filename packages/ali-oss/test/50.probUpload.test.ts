import assert from 'assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  client,
  bucket,
  CI,
} from './root.config.js'

import { ProbUpOptions } from '~/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('probeUpload should work', () => {
    it('normal', async () => {
      const opts: ProbUpOptions = {
        bucket,
      }
      const ret = await client.probeUpload(opts)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })
  })

})


