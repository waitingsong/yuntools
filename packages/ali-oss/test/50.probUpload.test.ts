import assert from 'assert/strict'
import { relative } from 'path'

import {
  client,
  bucket,
  CI,
} from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('probeUpload should work', () => {
    it('normal', async () => {
      const ret = await client.probeUpload(bucket)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })
  })

})


