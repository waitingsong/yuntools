import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import {
  cloudUrlPrefix,
  client,
  CI,
} from './root.config.js'


const __dirname = genCurrentDirname(import.meta.url)

describe(fileShortPath(import.meta.url), () => {

  describe('stat should work', () => {
    it('normal', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      await client.cp(src, dst)

      const ret = await client.stat(dst)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      const { data } = ret
      assert(data.ACL === 'default')
      assert(typeof data['Content-Length'] === 'number')
      assert(data['Content-Length'] > 0)
      assert(data['Content-Md5'])
      assert(data['Content-Md5'].length === 24, data['Content-Md5'])
      assert(data['Content-Type']?.includes('json'))

      await client.rm(dst)
    })
  })

})


