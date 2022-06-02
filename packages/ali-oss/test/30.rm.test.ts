import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import { CpOptions, RmOptions, StatOptions } from '../src/index.js'

import {
  cloudUrlPrefix,
  client,
  CI,
  bucket,
  src,
} from './root.config.js'


const __dirname = genCurrentDirname(import.meta.url)

describe(fileShortPath(import.meta.url), () => {

  describe('rm should work', () => {
    it('normal', async () => {
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: CpOptions = {
        bucket,
        src,
        target,
      }
      await client.cp(opts)

      const opts2: RmOptions = {
        bucket,
        target,
      }
      const ret = await client.rm(opts2)
      CI || console.log(ret)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })

    it('rescusive', async () => {
      const dir = `${cloudUrlPrefix}/bbb/${Date.now().toString()}`
      const target = `${dir}/${Date.now().toString()}-tsconfig.json`

      const opts: CpOptions = {
        bucket,
        src,
        target,
      }
      const cpRes = await client.cp(opts)
      CI || console.log({ cpRes })

      const opts2: StatOptions = {
        bucket,
        target,
      }
      const stat0 = await client.stat(opts2)
      assert(stat0.data)
      assert(stat0.data['Content-Length'])

      // file should not be unlinked
      const opts3: RmOptions = {
        bucket,
        target: dir,
      }
      const rmRes0 = await client.rm(opts3)
      CI || console.log({ rmRes0 })
      assert(rmRes0.data)

      const stat1 = await client.stat(opts2)
      CI || console.log(stat1)
      assert(stat1.data)
      assert(stat1.data['Content-Length'])


      const opts4: RmOptions = {
        ...opts2,
        recursive: true,
      }
      // file should be unlinked
      const rmRes1 = await client.rm(opts4)
      CI || console.log({ rmRes1 })
      assert(rmRes1.data)

      const statRes = await client.stat(opts2)
      console.log({ statRes })
      assert(statRes.exitCode, 'file not exists after recursive rm')
      assert(statRes.stderr.includes('NoSuchKey'))
      assert(statRes.stderr.includes('404'))
    })
  })

})


