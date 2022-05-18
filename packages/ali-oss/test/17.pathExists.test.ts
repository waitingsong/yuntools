import assert from 'assert/strict'
import { join, relative } from 'path'

import {
  cloudUrlPrefix,
  client,
  CI,
} from '@/root.config'
import { ACLKey, CpOptions } from '~/lib'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('pathExists should work', () => {
    it('file', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await client.cp(src, dst)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')

      const exists = await client.pathExists(dst)
      assert(exists === true)
      await client.rm(dst)
    })

    it('link', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      await client.cp(src, dst)

      const link = `${dst}-link`
      const ret = await client.createSymlink(dst, link)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      const exists = await client.pathExists(dst)
      assert(exists === true)

      await client.rm(dst)
    })

  })
})


