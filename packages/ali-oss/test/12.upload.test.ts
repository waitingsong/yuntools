import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import {
  ACLKey,
  Msg,
  encodeInputPath,
  UploadOptions,
} from '../src/index.js'

import { assertFileExists, assertUploadFiles } from './helper.js'
import {
  cloudUrlPrefix,
  client,
  client2,
  CI,
  bucket,
  src,
  srcDir,
  nameLT,
  srcLT,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const files: string[] = [
    nameLT,
    '1.txt',
    '2.txt',
    '.nycrc.json',
    'tsconfig.json',
    'subdir/1.txt',
    'subdir/2.txt',
    'subdir/.nycrc.json',
    'subdir/tsconfig.json',
  ]

  describe('upload should work', () => {
    it('normal', async () => {
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: UploadOptions = {
        bucket,
        src,
        target,
      }
      const ret = await client.upload(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${src} ${target} failed, ${ret.stderr}`)
      assertUploadFiles(ret.data, 1, 0, 1, 0, ret.stderr)
    })

    it('complex', async () => {

      const target = `${cloudUrlPrefix}/${nameLT}-${Date.now().toString()}-tsconfig.json`
      const opts: UploadOptions = {
        bucket,
        src: srcLT,
        target,
      }
      const ret = await client.upload(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${srcLT} ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')
    })

    it('complex encoded', async () => {
      const srcLTEncoded = encodeInputPath(srcLT, true)
      const target = `${cloudUrlPrefix}/${nameLT}-${Date.now().toString()}-tsconfig.json`
      const opts: UploadOptions = {
        bucket,
        src: srcLTEncoded,
        target,
        encodeSource: false,
      }
      const ret = await client.upload(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${srcLTEncoded} ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')
    })

    it('param:force', async () => {
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

    it('folder', async () => {
      const target = `${cloudUrlPrefix}/${Date.now().toString()}/`

      const opts: UploadOptions = {
        bucket,
        src: srcDir,
        target,
        recursive: true,
      }
      const ret = await client.upload(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${srcDir} ${target} failed, ${ret.stderr}`)
      assertUploadFiles(ret.data, 10, 1, 9, 0, ret.stderr)

      for await (const file of files) {
        await assertFileExists(client, bucket, target + file)
      }

      return
    })

    it('param:include', async () => {
      const target = `${cloudUrlPrefix}/${Date.now().toString()}/`

      const opts: UploadOptions = {
        bucket,
        src: srcDir,
        target,
        recursive: true,
        include: '*.txt',
      }
      const ret = await client.upload(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${srcDir} ${target} failed, ${ret.stderr}`)
      assertUploadFiles(ret.data, 5, 1, 4, 0, ret.stderr)

      for await (const file of files) {
        const d2 = join(target, file)

        if (file.endsWith('.txt')) {
          await assertFileExists(client, bucket, d2)
        }
        else {
          try {
            await assertFileExists(client, bucket, d2)
          }
          catch {
            continue
          }
          assert(false, `${file} should not exists`)
        }
      }
      return
    })
  })
})


