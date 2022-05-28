import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import { CpOptions } from '../src/index.js'

import {
  cloudUrlPrefix,
  client,
  client2,
  CI,
  bucket,
} from './root.config.js'


const __dirname = genCurrentDirname(import.meta.url)

describe(fileShortPath(import.meta.url), () => {

  describe('cp should work', () => {
    it('pass config file', async () => {
      assert(client2, 'client2 should be defined')

      const src = join(__dirname, 'tsconfig.json')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`

      const opts: CpOptions = {
        bucket,
        src,
        target,
      }
      const ret = await client2.cp(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `cp ${src} ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')
    })

  })
})


