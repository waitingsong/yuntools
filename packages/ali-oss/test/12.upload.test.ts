import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import {
  ACLKey,
  Msg,
  encodeInputPath,
  UploadOptions,
} from '../src/index.js'

import { assertFileExists } from './helper.js'
import {
  cloudUrlPrefix,
  client,
  client2,
  CI,
  bucket,
} from './root.config.js'


const __dirname = genCurrentDirname(import.meta.url)

describe(fileShortPath(import.meta.url), () => {

  const nameLT = '联通€-&a\'b^c=.json'
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

      const { data } = ret
      assert(data)
      assert(typeof data.elapsed === 'string', ret.stderr)
      assert(typeof data.averageSpeed === 'number', ret.stderr)
      assert(typeof data.succeedTotalNumber === 'number', ret.stderr)
      assert(data.succeedTotalNumber === 1, ret.stderr)
      assert(typeof data.succeedTotalSize === 'string', ret.stderr)
      assert(data.succeedTotalSize.length, ret.stderr)
      assert(typeof data.uploadDirs === 'undefined', ret.stderr)
      assert(data.uploadFiles === 1)
    })

    it('complex', async () => {
      const src = join(__dirname, 'files', nameLT)

      const target = `${cloudUrlPrefix}/${nameLT}-${Date.now().toString()}-tsconfig.json`
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
      const src0 = join(__dirname, 'files', nameLT)
      const src = encodeInputPath(src0, true)

      const target = `${cloudUrlPrefix}/${nameLT}-${Date.now().toString()}-tsconfig.json`
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

    it('folder', async () => {
      const src = join(__dirname, 'files')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}/`

      const opts: UploadOptions = {
        bucket,
        src,
        target,
        recursive: true,
      }
      const ret = await client.upload(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${src} ${target} failed, ${ret.stderr}`)

      const { data } = ret
      assert(data)
      assert(typeof data.elapsed === 'string', ret.stderr)
      assert(typeof data.averageSpeed === 'number', ret.stderr)
      assert(typeof data.succeedTotalNumber === 'number', ret.stderr)
      assert(data.succeedTotalNumber === 10, ret.stderr)
      assert(typeof data.succeedTotalSize === 'string', ret.stderr)
      assert(data.succeedTotalSize.length, ret.stderr)
      assert(data.uploadDirs === 1, ret.stderr)
      assert(data.uploadFiles === 9)

      for await (const file of files) {
        await assertFileExists(client, bucket, target + file)
      }

      return
    })

    it('param:include', async () => {
      const src = join(__dirname, 'files')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}/`

      const opts: UploadOptions = {
        bucket,
        src,
        target,
        recursive: true,
        include: '*.txt',
      }
      const ret = await client.upload(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${src} ${target} failed, ${ret.stderr}`)

      const { data } = ret
      assert(data)
      assert(typeof data.elapsed === 'string', ret.stderr)
      assert(typeof data.averageSpeed === 'number', ret.stderr)
      assert(typeof data.succeedTotalNumber === 'number', ret.stderr)
      assert(data.succeedTotalNumber === 5, ret.stderr)
      assert(typeof data.succeedTotalSize === 'string', ret.stderr)
      assert(data.succeedTotalSize.length, ret.stderr)
      assert(data.uploadDirs === 1, ret.stderr)
      assert(data.uploadFiles === 4)

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


