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

      const sign = await client.sign(dst, { disableEncodeSlash: true })
      assert(! sign.exitCode, `sign ${dst} failed, ${sign.stderr}`)
      assert(sign.data)

      const { data } = sign
      assert(data.httpUrl)
      assert(data.httpUrl.startsWith('https://'))
      assert(! data.httpUrl.includes('?Expires='))
      assert(! data.httpUrl.includes('AccessKeyId='))

      assert(data.httpShareUrl)
      assert(data.httpShareUrl.startsWith('https://'))
      assert(data.httpShareUrl.includes('?Expires='))
      assert(data.httpShareUrl.includes('AccessKeyId='))

      assert(data.link)
      assert(data.link.startsWith('https://'))
      assert(! data.link.includes('?Expires='))
      assert(! data.link.includes('AccessKeyId='))
      assert(! data.link.includes('%2F'))

      await client.rm(dst)
    })

    it('param trafic-limit (typo)', async () => {
      const src = join(__dirname, '../rollup.config.js')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-config.js`
      const ret = await client.cp(src, dst)
      CI || console.log(ret)
      assert(! ret.exitCode, `cp ${src} ${dst} failed, ${ret.stderr}`)
      assert(ret.data)

      const sign = await client.sign(dst, { trafficLimit: 245760, timeoutSec: 360 })
      assert(! sign.exitCode, `sign ${dst} failed, ${sign.stderr}`)
      assert(sign.data)

      const { data } = sign
      assert(data.httpShareUrl)

      await client.rm(dst)
    })

  })
})

