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

import { CpOptions, LinkOptions } from '~/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('createSymlink should work', () => {
    it('normal', async () => {
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`

      const opts: CpOptions = {
        bucket,
        src,
        target,
      }
      await client.cp(opts)

      const link = `${target}-link`
      const opts2: LinkOptions = {
        ...opts,
        src: target,
        target: link,
      }
      const ret = await client.createSymlink(opts2)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })
  })

})


