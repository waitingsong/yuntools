import assert from 'assert/strict'
import { join, relative } from 'path'

import { OSSService, Config } from '../src/index'

import { endpoint, accessKeyId, accessKeySecret, bucket } from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('probeUpload should work', () => {
    it('normal', async () => {
      const config: Config = {
        endpoint,
        accessKeyId,
        accessKeySecret,
      }

      const service = new OSSService(config)
      service.debug = true

      await service.probeUpload(bucket)
      assert(true)
    })
  }).timeout(180_000)

})


