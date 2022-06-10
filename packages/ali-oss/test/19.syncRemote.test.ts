import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath } from '@waiting/shared-core'

import { SyncOptions, SyncRemoteOptions } from '../src/index.js'

import { assertFileExists, assertUploadFiles } from './helper.js'
import {
  cloudUrlPrefix,
  client,
  CI,
  bucket,
  srcDir,
  files,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const target = `${cloudUrlPrefix}/sync-${Date.now().toString()}`

  describe('syncRemote should work', () => {
    it('include *.txt', async () => {
      const opts: SyncRemoteOptions = {
        bucket,
        src: srcDir,
        target,
        include: '*.txt',
      }
      const ret = await client.syncRemote(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${srcDir} ${target} failed, ${ret.stderr}`)
      assertUploadFiles(ret.data, 5, 1, 4, 0, ret.stderr)

      for (const file of files) {
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
    })

    it('all', async () => {
      const opts: SyncOptions = {
        bucket,
        src: srcDir,
        target,
      }
      const ret = await client.syncRemote(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${srcDir} ${target} failed, ${ret.stderr}`)
      assertUploadFiles(ret.data, 10, 1, 9, 0, ret.stderr)

      for (const file of files) {
        const d2 = join(target, file)
        await assertFileExists(client, bucket, d2)
      }
    })
  })
})


