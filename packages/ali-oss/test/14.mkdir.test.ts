import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  cloudUrlPrefix,
  client,
  CI,
} from './root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('mkdir should work', () => {
    it('normal', async () => {
      const dir = `${cloudUrlPrefix}/1${Math.random().toString()}`
      const ret = await client.mkdir(dir)
      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${dir} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      await client.rm(dir)
    })

    it('mchar', async () => {
      const dir = `${cloudUrlPrefix}/联通€-${Math.random().toString()}/v2/v3`
      const ret = await client.mkdir(dir)
      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${dir} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      await client.rm(dir)
    })

    it('syntax incorrect', async () => {
      const dir = `联通€-&a'b"c<d>e?f*-${Math.random().toString()}/v2/v3`
      try {
        await client.mkdir(dir)
      }
      catch (ex) {
        assert(ex instanceof Error, 'ex is Error')
        return
      }
      assert(false, `mkdir ${dir} should not work`)
    })

    it('param:encodingType encodeURIComponent work', async () => {
      const dir = `联通€-&a'b"c<d>e?f*-${Math.random().toString()}/v1/v2`
      const foo = encodeURIComponent(dir).replace(/'/ug, '%27')
      const dest = `${cloudUrlPrefix}/${foo}`
      const ret = await client.mkdir(dest, { encodingType: 'url' })
      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${dir} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      await client.rm(dest, { encodingType: 'url' })
    })

    it('param:encodingType encodeURI now work', async () => {
      const prefix = '联通'
      const dir = `${prefix}&a'b"c<d>e?f*-${Math.random().toString()}/v2/v3`
      const foo = encodeURI(dir)
      const dest = `${cloudUrlPrefix}/${foo}`
      try {
        await client.mkdir(dest, { encodingType: 'url' })
      }
      catch (ex) {
        assert(ex instanceof Error, 'ex is Error')
        const dest2 = `${cloudUrlPrefix}/${prefix}/`
        await client.rm(dest2)
        return
      }
      assert(false, `mkdir ${dir} should not work`)
    })

  })
})

