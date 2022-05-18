import assert from 'assert/strict'
import { join, relative } from 'path'

import {
  cloudUrlPrefix,
  client,
  CI,
} from '@/root.config'
import { ACLKey, CpOptions, Msg } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('sign should work', () => {
    it('normal', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await client.cp(src, dst)
      CI || console.log(ret)
      assert(! ret.exitCode, `cp ${src} ${dst} failed, ${ret.stderr}`)
      assert(ret.data)

      const sign = await client.sign(dst, { 'disable-encode-slash': true })
      assert(! sign.exitCode, `sign ${dst} failed, ${sign.stderr}`)
      assert(sign.data)
      assert(sign.data.httpUrl)
      assert(sign.data.httpUrl.startsWith('https://'))

      assert(sign.data.httpShareUrl)
      assert(sign.data.httpShareUrl.startsWith('https://'))
      assert(sign.data.httpShareUrl.includes('?Expires='))
      assert(sign.data.httpShareUrl.includes('AccessKeyId='))

      await client.rm(dst)
    })

  })
})


