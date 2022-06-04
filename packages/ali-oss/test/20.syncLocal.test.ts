import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import { fileShortPath } from '@waiting/shared-core'

import { SyncOptions } from '../src/index.js'

import { assertLocalFileExists, assertUploadFiles } from './helper.js'
import {
  cloudUrlPrefix,
  client,
  CI,
  bucket,
  srcDir,
  files,
  testDir,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const target = `${cloudUrlPrefix}/sync-${Date.now().toString()}`

  describe('syncLocal should work', () => {
    it('include *.txt', async () => {
      const opts: SyncOptions = {
        bucket,
        src: srcDir,
        target,
      }
      await client.syncLocal2Cloud(opts)

      const localDir = join(testDir, 'tmp', `files-${Math.random().toString()}/`)
      await mkdir(localDir, { recursive: true })
      const opts2: SyncOptions = {
        bucket,
        src: target,
        target: localDir,
        include: '*.txt',
      }
      const ret = await client.syncLocal(opts2)
      CI || console.log(ret)

      for await (const file of files) {
        const d2 = join(localDir, file)

        if (file.endsWith('.txt')) {
          await assertLocalFileExists(d2)
        }
        else {
          try {
            await assertLocalFileExists(d2)
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
      await client.syncLocal2Cloud(opts)

      const localDir = join(testDir, 'tmp', `files-${Math.random().toString()}/`)
      await mkdir(localDir, { recursive: true })
      const opts2: SyncOptions = {
        bucket,
        src: target,
        target: localDir,
      }
      const ret = await client.syncLocal(opts2)
      CI || console.log(ret)

      for await (const file of files) {
        const d2 = join(localDir, file)
        await assertLocalFileExists(d2)
      }
    })
  })
})

