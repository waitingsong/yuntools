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

  describe('rm should work', () => {
    it('normal', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      await client.cp(src, dst)
      const ret = await client.rm(dst)
      CI || console.log(ret)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })

    it('rescusive', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dir = `${cloudUrlPrefix}/bbb/${Date.now().toString()}`
      const dst = `${dir}/${Date.now().toString()}-tsconfig.json`

      const cpRes = await client.cp(src, dst)
      CI || console.log({ cpRes })

      const stat0 = await client.stat(dst)
      assert(stat0.data)
      assert(stat0.data['Content-Length'])

      // file should not be unlinked
      const rmRes0 = await client.rm(dir)
      CI || console.log({ rmRes0 })
      assert(rmRes0.data)

      const stat1 = await client.stat(dst)
      CI || console.log(stat1)
      assert(stat1.data)
      assert(stat1.data['Content-Length'])

      // file should be unlinked
      const rmRes1 = await client.rm(dir, { recursive: true })
      CI || console.log({ rmRes1 })
      assert(rmRes1.data)

      const statRes = await client.stat(dst)
      console.log({ statRes })
      assert(statRes.exitCode, 'file not exists after recursive rm')
      assert(statRes.stderr.includes('NoSuchKey'))
      assert(statRes.stderr.includes('404'))
    })
  })

})


