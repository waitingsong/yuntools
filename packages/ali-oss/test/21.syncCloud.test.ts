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

import { SyncCloudOptions } from '~/lib/method/sync.js'


describe(fileShortPath(import.meta.url), () => {

  const target = `${cloudUrlPrefix}/sync-${Date.now().toString()}`

  describe('syncCloud should work', () => {
    it('include *.txt', async () => {
      const opts: SyncRemoteOptions = {
        bucket,
        src: srcDir,
        target,
      }
      await client.syncRemote(opts)

      const target2 = `${cloudUrlPrefix}/sync-${Date.now().toString()}`
      const opts2: SyncCloudOptions = {
        bucket,
        src: target,
        target: target2,
        include: '*.txt',
      }
      const ret = await client.syncCloud(opts2)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${target2} ${target} failed, ${ret.stderr}`)
      assertUploadFiles(ret.data, 4, 0, 0, 4, ret.stderr)

      for (const file of files) {
        const d2 = join(target2, file)

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

  })
})


