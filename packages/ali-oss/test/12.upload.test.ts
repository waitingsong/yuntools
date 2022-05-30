import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import {
  ACLKey,
  Msg,
  encodeInputPath,
  UploadOptions,
} from '../src/index.js'

import {
  cloudUrlPrefix,
  client,
  client2,
  CI,
  bucket,
} from './root.config.js'


const __dirname = genCurrentDirname(import.meta.url)

describe(fileShortPath(import.meta.url), () => {

  describe('upload should work', () => {
    it('normal', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: UploadOptions = {
        bucket,
        src,
        target,
      }
      const ret = await client.upload(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${src} ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')
    })

    it('complex', async () => {
      const name = '联通€-&a\'b^c=.json'
      const src = join(__dirname, name)

      const target = `${cloudUrlPrefix}/${name}-${Date.now().toString()}-tsconfig.json`
      const opts: UploadOptions = {
        bucket,
        src,
        target,
      }
      const ret = await client.upload(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${src} ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')
    })

    it('complex encoded', async () => {
      const name = '联通€-&a\'b^c=.json'
      const src0 = join(__dirname, name)
      const src = encodeInputPath(src0, true)

      const target = `${cloudUrlPrefix}/${name}-${Date.now().toString()}-tsconfig.json`
      const opts: UploadOptions = {
        bucket,
        src,
        target,
        encodeSource: false,
      }
      const ret = await client.upload(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${src} ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')
    })

    it('param:force', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: UploadOptions = {
        bucket,
        src,
        target,
      }
      await client.upload(opts)

      // let dupFlag = false
      // try {
      //   await new Promise<void>((done, reject) => {
      //     client.upload(opts)
      //       .then(() => {
      //         done()
      //       })
      //       .catch((err) => {
      //         reject(err)
      //       })
      //     setTimeout(() => {
      //       reject('timeout')
      //     }, 5000)
      //   })

      // }
      // catch (ex) {
      //   // console.info(ex)
      //   assert(typeof ex === 'string')
      //   assert(ex === 'timeout')
      //   dupFlag = true
      // }
      // assert(dupFlag === true, 'should throw error')

      opts.force = true
      const ret = await client.upload(opts)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')
    })

    it('duplicate detection', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: UploadOptions = {
        bucket,
        src,
        target,
      }
      const ret = await client.upload(opts)
      CI || console.log({ ret })
      assert(ret.exitCode === 0)
      assert(ret.data)

      const ret2 = await client.upload(opts)
      CI || console.log({ ret2 })
      assert(ret2.exitCode === 1)
      assert(ret2.stderr.includes(Msg.cloudFileAlreadyExists))
    })

    it('acl:private', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: UploadOptions = {
        bucket,
        src,
        target,
        acl: ACLKey.private,
      }
      const ret = await client.upload(opts)
      assert(! ret.exitCode)
      assert(ret.data)

      const statRet = await client.stat(opts)
      assert(! statRet.exitCode)
      const { data } = statRet
      assert(data)
      assert(data.ACL === 'private', data.ACL)
      assert(data.ACL === ACLKey.private, data.ACL)
    })

    it('acl:public-read', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: UploadOptions = {
        bucket,
        src,
        target,
        acl: ACLKey.publicRead,
      }
      const ret = await client.upload(opts)
      assert(ret.exitCode === 0)
      assert(ret.data)

      const statRet = await client.stat(opts)
      CI || console.log({ statRet })
      assert(statRet.exitCode === 0)
      const { data } = statRet
      assert(data)
      assert(data.ACL === 'public', data.ACL)
    })

    it('acl:public-read-write', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: UploadOptions = {
        bucket,
        src,
        target,
        acl: ACLKey.publicReadWrite,
      }
      const ret = await client.upload(opts)
      assert(ret.exitCode === 0)
      assert(ret.data)

      const statRet = await client.stat(opts)
      CI || console.log({ statRet })
      assert(statRet.exitCode === 0)
      const { data } = statRet
      assert(data)
      assert(data.ACL === 'public', data.ACL)
    })

    it('failed with invalid bucket', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`

      const bucketFake = 'fake' + Date.now().toString()
      const opts: UploadOptions = {
        bucket: bucketFake,
        src,
        target,
        acl: ACLKey.publicReadWrite,
      }

      const ret = await client.upload(opts)
      CI || console.log(ret)
      assert(ret.exitCode, `should cp ${src} ${target} failed, ${ret.stdout}`)
      assert(ret.stderr.includes(Msg.noSuchBucket))
    })

    it('failed with invaild endpoint', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`

      const endpoint = 'https://oss-cn-beijing.aliyuncs.com'
      const opts: UploadOptions = {
        bucket,
        src,
        target,
        acl: ACLKey.publicReadWrite,
        endpoint,
      }

      const ret = await client.upload(opts)
      CI || console.log(ret)
      assert(ret.exitCode, `should upload ${src} ${target} failed, ${ret.stdout}`)
      assert(ret.stderr.includes(Msg.accessDenied))
    })

    it('pass config file', async () => {
      assert(client2, 'client2 should be defined')

      const src = join(__dirname, 'tsconfig.json')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`

      const opts: UploadOptions = {
        bucket,
        src,
        target,
      }
      const ret = await client2.upload(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${src} ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')
    })

  })
})


