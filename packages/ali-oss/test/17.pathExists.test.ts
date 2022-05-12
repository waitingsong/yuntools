import assert from 'assert/strict'
import { join, relative } from 'path'

import {
  cloudUrlPrefix,
  service,
  CI,
} from '@/root.config'
import { ACLKey, CpOptions } from '~/lib'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('pathExists should work', () => {
    it('file', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await service.cp(src, dst)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')

      const exists = await service.pathExists(dst)
      assert(exists === true)
      await service.rm(dst)
    })

    it('link', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      await service.cp(src, dst)

      const link = `${dst}-link`
      const ret = await service.createSymlink(dst, link)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      const exists = await service.pathExists(dst)
      assert(exists === true)

      await service.rm(dst)
    })

  })
})


