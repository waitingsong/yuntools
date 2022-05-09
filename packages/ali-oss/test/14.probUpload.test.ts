import assert from 'assert/strict'
import { relative } from 'path'

import {
  service,
  bucket,
  CI,
} from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('probeUpload should work', () => {
    it('normal', async () => {
      const ret = await service.probeUpload(bucket)
      CI || console.log(ret)
      assert(ret.data)
    })
  })

})


