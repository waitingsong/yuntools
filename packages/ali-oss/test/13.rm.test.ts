import assert from 'assert/strict'
import { join, relative } from 'path'

import {
  pathPrefix,
  service,
} from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('createSymlink should work', () => {
    it('normal', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${pathPrefix}/test-1234/${Date.now().toString()}-tsconfig.json`
      await service.cp(src, dst)

      await service.rm(dst)
      console.log({ dst })

      assert(true)
    })
  })

})


