import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  cloudUrlPrefix,
  client,
  CI,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('mkdir should work', () => {
    it('normal', async () => {
      const dir = `${cloudUrlPrefix}/${Math.random().toString()}`
      const ret = await client.mkdir(dir)
      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${dir} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      await client.rm(dir)
    })
  })

})


