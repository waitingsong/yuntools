import assert from 'assert/strict'
import { join, relative } from 'path'

import {
  cloudUrlPrefix,
  client,
  CI,
} from '@/root.config'
import { ACLKey, CpOptions, Msg } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('cp should work', () => {
    it('normal', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await client.cp(src, dst)
      CI || console.log(ret)
      assert(! ret.exitCode, `cp ${src} ${dst} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')

      await client.rm(dst)
    })

    it('param:force', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      await client.cp(src, dst)

      const opts: CpOptions = {
        force: true,
      }
      const ret = await client.cp(src, dst, opts)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')

      await client.rm(dst)
    })

    it('duplicate detection', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await client.cp(src, dst)
      CI || console.log({ ret })
      assert(ret.exitCode === 0)
      assert(ret.data)

      const ret2 = await client.cp(src, dst)
      CI || console.log({ ret2 })
      assert(ret2.exitCode === 1)
      assert(ret2.stderr.includes(Msg.cloudFileAlreadyExists))

      await client.rm(dst)
    })

    it('acl:private', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: CpOptions = {
        acl: ACLKey.private,
      }
      const ret = await client.cp(src, dst, opts)
      assert(ret.exitCode === 0)
      assert(ret.data)

      const statRet = await client.stat(dst)
      assert(statRet.exitCode === 0)
      const { data } = statRet
      assert(data)
      assert(data.ACL === 'private', data.ACL)
      assert(data.ACL === ACLKey.private, data.ACL)

      await client.rm(dst)
    })

    it('acl:public-read', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: CpOptions = {
        acl: ACLKey.publicRead,
      }
      const ret = await client.cp(src, dst, opts)
      assert(ret.exitCode === 0)
      assert(ret.data)

      const statRet = await client.stat(dst)
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
      const ret = await client.cp(src, dst, opts)
      assert(ret.exitCode === 0)
      assert(ret.data)

      const statRet = await client.stat(dst)
      CI || console.log({ statRet })
      assert(statRet.exitCode === 0)
      const { data } = statRet
      assert(data)
      assert(data.ACL === 'public', data.ACL)

      await client.rm(dst)
    })

    it('failed with invalid bucket', async () => {
      const bucket = 'fake' + Date.now().toString()

      const src = join(__dirname, 'tsconfig.json')
      const dst = `oss://${bucket}/${Date.now().toString()}-tsconfig.json`
      const ret = await client.cp(src, dst)
      CI || console.log(ret)
      assert(ret.exitCode, `should cp ${src} ${dst} failed, ${ret.stdout}`)
      assert(ret.stderr.includes(Msg.noSuchBucket))
    })

    it('failed with invaild endpoint', async () => {
      const endpoint = 'https://oss-cn-beijing.aliyuncs.com'

      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await client.cp(src, dst, { endpoint })
      CI || console.log(ret)
      assert(ret.exitCode, `should cp ${src} ${dst} failed, ${ret.stdout}`)
      assert(ret.stderr.includes(Msg.accessDenied))
    })

  })
})


