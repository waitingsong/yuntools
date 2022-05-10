import assert from 'assert/strict'
import { relative } from 'path'

import {
  pathPrefix,
  service,
  CI,
} from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('mkdir should work', () => {
    it('normal', async () => {
      const dir = `${pathPrefix}/test-1234/${Math.random().toString()}`
      const ret = await service.mkdir(dir)
      CI || console.log(ret)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      await service.rm(dir)
    })
  })

})


