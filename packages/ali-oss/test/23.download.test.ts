import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import { fileShortPath } from '@waiting/shared-core'

import { UploadOptions } from '../src/index.js'

import {
  cloudUrlPrefix,
  client,
  CI,
  bucket,
  src,
  testDir,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('download should work', () => {
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

      const localDir = join(testDir, 'tmp', `files-${Math.random().toString()}/`)
      await mkdir(localDir, { recursive: true })

      const localFile = join(localDir, 'tsconfig.json')

      const down = await client.download({
        bucket,
        src: target,
        target: localFile,
      })
      CI || console.log(down)
      assert(! down.exitCode, `down ${target} ${localFile} failed, ${down.stderr}`)
      const { data } = down
      assert(data)
      assert(data.averageSpeed)
      assert(data.downloadObjects === 1)
      assert(data.succeedTotalSize)
    })

  })
})


