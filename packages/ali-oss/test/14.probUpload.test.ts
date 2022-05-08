import assert from 'assert/strict'
import { relative } from 'path'

import {
  pathPrefix,
  service,
  bucket,
} from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('probeUpload should work', () => {
    it('normal', async () => {
      await service.probeUpload(bucket)
      assert(true)
    })
  })

})


