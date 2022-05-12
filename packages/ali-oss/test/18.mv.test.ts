import assert from 'assert/strict'
import { join, relative } from 'path'

import {
  cloudUrlPrefix,
  service,
  CI,
} from '@/root.config'
import { Msg } from '~/lib'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('mv should work', () => {
    it('file', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await service.cp(src, dst)
      assert(! ret.exitCode)

      const dst2 = `${dst}-${Date.now().toString()}`
      const mv = await service.mv(dst, dst2)
      assert(! mv.exitCode)

      const existsDst = await service.pathExists(dst2)
      assert(existsDst === true)

      const existsOri = await service.pathExists(dst)
      assert(existsOri === false)

      await service.rm(dst2)
    })

    it('cloud file dst already exists', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await service.cp(src, dst)
      assert(! ret.exitCode)

      const dst2 = `${dst}-${Date.now().toString()}`
      const cp = await service.cp(dst, dst2)
      assert(! cp.exitCode, cp.stderr)

      const mv = await service.mv(dst, dst2)
      assert(mv.exitCode, mv.stderr)
      assert(mv.stderr.includes(Msg.cloudFileAlreadyExists))

      await service.rm(dst)
      await service.rm(dst2)
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

      const link2 = `${link}-${Date.now().toString()}`
      const mv = await service.mv(link, link2)
      assert(! mv.exitCode)

      const existsDst = await service.pathExists(link2)
      assert(existsDst === true)

      const existsOri = await service.pathExists(link)
      assert(existsOri === false)

      await service.rm(dst)
      await service.rm(link2)
    })

  })
})


