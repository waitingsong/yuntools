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

  describe('cp should work', () => {
    it('normal', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await service.cp(src, dst)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')

      await service.rm(dst)
    })

    it('param:force', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      await service.cp(src, dst)

      const opts: CpOptions = {
        force: true,
      }
      const ret = await service.cp(src, dst, opts)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')

      await service.rm(dst)
    })

    it('duplicate detection', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await service.cp(src, dst)
      CI || console.log({ ret })
      assert(ret.exitCode === 0)
      assert(ret.data)

      const ret2 = await service.cp(src, dst)
      CI || console.log({ ret2 })
      assert(ret2.exitCode === 1)
      assert(ret2.stderr.includes('Cloud File already exists'))

      await service.rm(dst)
    })

    it('acl:private', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: CpOptions = {
        acl: ACLKey.private,
      }
      const ret = await service.cp(src, dst, opts)
      assert(ret.exitCode === 0)
      assert(ret.data)

      const statRet = await service.stat(dst)
      assert(statRet.exitCode === 0)
      const { data } = statRet
      assert(data)
      assert(data.ACL === 'private', data.ACL)
      assert(data.ACL === ACLKey.private, data.ACL)

      await service.rm(dst)
    })

    it('acl:public-read', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: CpOptions = {
        acl: ACLKey.publicRead,
      }
      const ret = await service.cp(src, dst, opts)
      assert(ret.exitCode === 0)
      assert(ret.data)

      const statRet = await service.stat(dst)
      CI || console.log({ statRet })
      assert(statRet.exitCode === 0)
      const { data } = statRet
      assert(data)
      assert(data.ACL === 'public', data.ACL)
    })

    it('acl:public-read-write', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: CpOptions = {
        acl: ACLKey.publicReadWrite,
      }
      const ret = await service.cp(src, dst, opts)
      assert(ret.exitCode === 0)
      assert(ret.data)

      const statRet = await service.stat(dst)
      CI || console.log({ statRet })
      assert(statRet.exitCode === 0)
      const { data } = statRet
      assert(data)
      assert(data.ACL === 'public', data.ACL)

      await service.rm(dst)
    })
  })
})


