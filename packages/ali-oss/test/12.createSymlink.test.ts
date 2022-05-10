import assert from 'assert/strict'
import { join, relative } from 'path'

import {
  cloudUrlPrefix,
  service,
  CI,
} from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('createSymlink should work', () => {
    it('normal', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/test-1234/${Date.now().toString()}-tsconfig.json`
      await service.cp(src, dst)

      const link = `${dst}-link`
      const ret = await service.createSymlink(dst, link)
      CI || console.log(ret)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      await service.rm(dst)
    })
  })

})


