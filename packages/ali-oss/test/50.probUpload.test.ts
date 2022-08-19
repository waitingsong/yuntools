import assert from 'assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  client,
  bucket,
  CI,
  cloudUrlPrefix,
} from './root.config.js'

import { ProbUpOptions, RmrfOptions } from '~/index.js'


describe(fileShortPath(import.meta.url), () => {

  beforeEach(async () => {
    const target = `${cloudUrlPrefix}/`
    const rmOpts: RmrfOptions = {
      bucket,
      target,
    }
    await client.rmrf(rmOpts)
  })


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


