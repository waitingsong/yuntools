import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath } from '@waiting/shared-core'

import {
  cloudUrlPrefix,
  client,
  CI,
  bucket,
  src,
} from './root.config.js'

import { CpOptions, SignOptions } from '~/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('sign should work', () => {
    it('normal', async () => {
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: CpOptions = {
        bucket,
        src,
        target,
      }
      const ret = await client.cp(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `cp ${src} ${target} failed, ${ret.stderr}`)
      assert(ret.data)

      const opts2: SignOptions = {
        bucket,
        src: target,
        disableEncodeSlash: true,
      }
      const sign = await client.sign(opts2)
      assert(! sign.exitCode, `sign ${target} failed, ${sign.stderr}`)
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
    })

    it('param trafic-limit (typo)', async () => {
      const src2 = join(__dirname, '../rollup.config.js')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-config.js`
      const opts: CpOptions = {
        bucket,
        src: src2,
        target,
      }
      const ret = await client.cp(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `cp ${src2} ${target} failed, ${ret.stderr}`)
      assert(ret.data)

      const opts2: SignOptions = {
        bucket,
        src: target,
        trafficLimit: 245760,
        timeoutSec: 360,
      }
      const sign = await client.sign(opts2)
      assert(! sign.exitCode, `sign ${target} failed, ${sign.stderr}`)
      assert(sign.data)

      const { data } = sign
      assert(data.httpShareUrl)
    })

  })
})


