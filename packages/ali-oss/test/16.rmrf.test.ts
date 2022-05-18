import assert from 'assert/strict'
import { join, relative } from 'path'

import {
  cloudUrlPrefix,
  client,
  CI,
} from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('rmrf should work', () => {
    it('normal', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dir = `${cloudUrlPrefix}/bbb/${Date.now().toString()}`
      const dst = `${dir}/${Date.now().toString()}-tsconfig.json`

      const cpRes = await client.cp(src, dst)
      assert(cpRes.exitCode === 0)

      const stat0 = await client.stat(dst)
      assert(stat0.data)
      assert(stat0.data['Content-Length'])

      // file should be unlinked
      const rmRes1 = await client.rmrf(dir)
      CI || console.log({ rmRes1 })
      assert(rmRes1.exitCode === 0)

      const statRes = await client.stat(dst)
      console.log({ statRes })
      assert(statRes.exitCode, 'file not exists after recursive rm')
      assert(statRes.stderr.includes('NoSuchKey'))
      assert(statRes.stderr.includes('404'))
    })
  })

})


