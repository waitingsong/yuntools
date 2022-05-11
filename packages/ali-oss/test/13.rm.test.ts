import assert from 'assert/strict'
import { join, relative } from 'path'

import {
  cloudUrlPrefix,
  service,
  CI,
} from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('rm should work', () => {
    it('normal', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      await service.cp(src, dst)
      const ret = await service.rm(dst)
      CI || console.log(ret)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })

    it('rescusive', async () => {

      const src = join(__dirname, 'tsconfig.json')
      const dir = `${cloudUrlPrefix}/bbb/${Date.now().toString()}`
      const dst = `${dir}/${Date.now().toString()}-tsconfig.json`

      const cpRes = await service.cp(src, dst)
      CI || console.log({ cpRes })

      const stat0 = await service.stat(dst)
      assert(stat0.data)
      assert(stat0.data['Content-Length'])

      // file should not be unlinked
      const rmRes0 = await service.rm(dir)
      CI || console.log({ rmRes0 })
      assert(rmRes0.data)

      const stat1 = await service.stat(dst)
      CI || console.log(stat1)
      assert(stat1.data)
      assert(stat1.data['Content-Length'])

      // file should be unlinked
      const rmRes1 = await service.rm(dir, { recursive: true })
      CI || console.log({ rmRes1 })
      assert(rmRes1.data)

      try {
        await service.stat(dst)
      }
      catch (ex) {
        const { message } = ex as Error
        assert(message.includes('NoSuchKey'))
        return
      }
      assert(false, 'should throw error but not')
    })
  })

})


