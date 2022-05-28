import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  cloudUrlPrefix,
  client,
  CI,
  bucket,
} from './root.config.js'

import { MkdirOptions, RmOptions } from '~/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('mkdir should work', () => {
    it('normal', async () => {
      const target = `${cloudUrlPrefix}/1${Math.random().toString()}/`
      const opts: MkdirOptions = {
        bucket,
        target,
      }
      const ret = await client.mkdir(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })

    it('mchar', async () => {
      const target = `${cloudUrlPrefix}/联通€-&a'b"c<d>e^f?g*-${Math.random().toString()}/v2/v3/`
      const opts: MkdirOptions = {
        bucket,
        target,
      }
      const ret = await client.mkdir(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })

    it('incorrect dir name when encodeTarget:false', async () => {
      const prefix = `${cloudUrlPrefix}/联通€-`
      const target = `${prefix}&a'b"c<d>e?f*-${Math.random().toString()}/v2/v3/`
      const opts: MkdirOptions = {
        bucket,
        target,
        encodeTarget: false,
      }
      try {
        const ret = await client.mkdir(opts)
        CI || console.log(ret)
        assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
        assert(ret.data)
      }
      catch (ex) {
        assert(ex instanceof Error, 'ex is Error')
        const opts2: RmOptions = {
          bucket,
          target: prefix + '/',
        }
        await client.rm(opts2)
        return
      }
      assert(false, 'should throw err but not')
    })
  })
})

