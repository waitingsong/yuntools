import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  cloudUrlPrefix,
  client,
  client3,
  CI,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe.only('mkdir should work', () => {
    it('normal', async () => {
      const dir = `${cloudUrlPrefix}/${Math.random().toString()}`
      const ret = await client.mkdir(dir)
      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${dir} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      await client.rm(dir)
    })

    it('deep', async () => {
      if (! CI) { // only for ci
        return
      }

      assert(client3, 'client3 is undefined')

      const dir = `${cloudUrlPrefix}/foo/bar/${Math.random().toString()}`
      const ret = await client3.mkdir(dir)
      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${dir} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      await client3.rm(dir)
    })
  })

})


