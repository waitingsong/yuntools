import assert from 'assert/strict'
import { relative } from 'path'

import {
  pathPrefix,
  service,
} from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('mkdir should work', () => {
    it('normal', async () => {
      const dir = `${pathPrefix}/test-1234/${Math.random().toString()}`
      await service.mkdir(dir)
      assert(true)
    })
  })

})


