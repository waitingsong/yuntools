import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import { Msg } from '../src/lib/index.js'

import {
  cloudUrlPrefix,
  client,
  CI,
} from './root.config.js'


const __dirname = genCurrentDirname(import.meta.url)

describe(fileShortPath(import.meta.url), () => {

  describe('mv should work', () => {
    it('file', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await client.cp(src, dst)
      assert(! ret.exitCode)

      const dst2 = `${dst}-${Date.now().toString()}`
      const mv = await client.mv(dst, dst2)
      assert(! mv.exitCode)

      const existsDst = await client.pathExists(dst2)
      assert(existsDst === true)

      const existsOri = await client.pathExists(dst)
      assert(existsOri === false)

      await client.rm(dst2)
    })

    it('cloud file dst already exists', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await client.cp(src, dst)
      assert(! ret.exitCode)

      const dst2 = `${dst}-${Date.now().toString()}`
      const cp = await client.cp(dst, dst2)
      assert(! cp.exitCode, cp.stderr)

      const mv = await client.mv(dst, dst2)
      assert(mv.exitCode, mv.stderr)
      assert(mv.stderr.includes(Msg.cloudFileAlreadyExists))

      await client.rm(dst)
      await client.rm(dst2)
    })

    it('link', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const dst = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      await client.cp(src, dst)

      const link = `${dst}-link`
      const ret = await client.createSymlink(dst, link)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      const exists = await client.pathExists(dst)
      assert(exists === true)

      const link2 = `${link}-${Date.now().toString()}`
      const mv = await client.mv(link, link2)
      assert(! mv.exitCode)

      const existsDst = await client.pathExists(link2)
      assert(existsDst === true)

      const existsOri = await client.pathExists(link)
      assert(existsOri === false)

      await client.rm(dst)
      await client.rm(link2)
    })

  })
})


