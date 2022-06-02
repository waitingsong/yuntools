import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath } from '@waiting/shared-core'

import {
  cloudUrlPrefix,
  client,
  CI,
  bucket,
  src,
} from './root.config.js'

import { CpOptions, RmrfOptions, StatOptions } from '~/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('rmrf should work', () => {
    it('normal', async () => {
      const dir = `${cloudUrlPrefix}/bbb/${Date.now().toString()}`
      const target = `${dir}/${Date.now().toString()}-tsconfig.json`

      const opts: CpOptions = {
        bucket,
        src,
        target,
      }
      const cpRes = await client.cp(opts)
      assert(cpRes.exitCode === 0)

      const opts2: StatOptions = {
        bucket,
        target,
      }
      const stat0 = await client.stat(opts2)
      assert(stat0.data)
      assert(stat0.data['Content-Length'])

      // file should be unlinked
      const opts3: RmrfOptions = {
        bucket,
        target: dir,
      }
      const rmRes1 = await client.rmrf(opts3)
      CI || console.log({ rmRes1 })
      assert(rmRes1.exitCode === 0)

      const statRes = await client.stat(opts2)
      console.log({ statRes })
      assert(statRes.exitCode, 'file not exists after recursive rm')
      assert(statRes.stderr.includes('NoSuchKey'))
      assert(statRes.stderr.includes('404'))
    })
  })

})


