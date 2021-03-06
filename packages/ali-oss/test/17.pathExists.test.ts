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

import { CpOptions, PathExistsOptions } from '~/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('pathExists should work', () => {
    it('file', async () => {
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`

      const opts: CpOptions = {
        bucket,
        src,
        target,
      }
      const ret = await client.cp(opts)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')

      const opts2: PathExistsOptions = {
        bucket,
        target,
      }
      const exists = await client.pathExists(opts2)
      assert(exists === true)
    })

    // it('link', async () => {
    //   const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
    //   await client.cp(src, dst)

    //   const link = `${dst}-link`
    //   const ret = await client.createSymlink(dst, link)
    //   CI || console.log(ret)
    //   assert(ret.exitCode === 0)
    //   assert(ret.data)
    //   assert(typeof ret.data.elapsed === 'string')

    //   const exists = await client.pathExists(dst)
    //   assert(exists === true)

    //   await client.rm(dst)
    // })

  })
})


