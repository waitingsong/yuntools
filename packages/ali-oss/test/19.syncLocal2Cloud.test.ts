import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import { SyncOptions } from '../src/index.js'

import { assertFileExists } from './helper.js'
import {
  cloudUrlPrefix,
  client,
  CI,
  bucket,
  srcDir,
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

      for await (const file of files) {
        const d2 = join(target, file)
        await assertFileExists(client, bucket, d2)
      }
    })
  })
})


