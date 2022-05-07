import assert from 'assert/strict'
import { relative } from 'path'

import { OSSService, Config } from '../src/index'

import { endpoint, accessKeyID, accessKeySecret, bucket } from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('mkdir should work', () => {
    it('normal', async () => {
      const config: Config = {
        // language: 'EN',
        endpoint,
        accessKeyID,
        accessKeySecret,
      }

      const service = new OSSService(config)
      service.debug = true

      const dir = `${bucket}/test-1234/${Math.random().toString()}`
      await service.mkdir(dir)
      assert(true)
    })
  })

})


