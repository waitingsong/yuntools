import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath } from '@waiting/shared-core'

import { SyncOptions } from '../src/index.js'

import { assertFileExists, assertUploadFiles } from './helper.js'
import {
  cloudUrlPrefix,
  client,
  CI,
  bucket,
  srcDir,
  nameLT,
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
  const target = `${cloudUrlPrefix}/sync-${Date.now().toString()}`

  describe('syncLocal2Cloud should work', () => {
    it('only txt', async () => {
      const opts: SyncOptions = {
        bucket,
        src: srcDir,
        target,
        include: '*.txt',
      }
      const ret = await client.syncLocal2Cloud(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${srcDir} ${target} failed, ${ret.stderr}`)
      assertUploadFiles(ret.data, 5, 1, 4, ret.stderr)

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
    })

    it('all', async () => {
      const opts: SyncOptions = {
        bucket,
        src: srcDir,
        target,
      }
      const ret = await client.syncLocal2Cloud(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${srcDir} ${target} failed, ${ret.stderr}`)
      assertUploadFiles(ret.data, 10, 1, 9, ret.stderr)

      for await (const file of files) {
        const d2 = join(target, file)
        await assertFileExists(client, bucket, d2)
      }
    })
  })
})


