import assert from 'assert/strict'
import { join, relative } from 'path'

import { OSSService, Config } from '../src/index'

import { endpoint, accessKeyId, accessKeySecret, bucket } from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('createSymlink should work', () => {
    it('normal', async () => {
      const config: Config = {
        endpoint,
        accessKeyId,
        accessKeySecret,
      }

      const service = new OSSService(config)
      service.debug = true

      const src = join(__dirname, 'tsconfig.json')
      const dst = `${bucket}/test-1234/${Date.now().toString()}-tsconfig.json`
      await service.cp(src, dst)

      await service.rm(dst)
      console.log({ dst })

      assert(true)
    })
  })

})


