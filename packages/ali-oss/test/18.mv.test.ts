import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import {
  Msg,
  CpOptions,
  MvOptions,
  PathExistsOptions,
  LinkOptions,
} from '../src/index.js'

import {
  cloudUrlPrefix,
  client,
  CI,
  bucket,
} from './root.config.js'


const __dirname = genCurrentDirname(import.meta.url)

describe(fileShortPath(import.meta.url), () => {

  describe('mv should work', () => {
    it('file', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`

      const opts: CpOptions = {
        bucket,
        src,
        target,
      }
      const ret = await client.cp(opts)
      assert(! ret.exitCode)

      const newPath = `${target}-${Date.now().toString()}`
      const opts2: MvOptions = {
        bucket,
        src: target,
        target: newPath,
      }
      const mv = await client.mv(opts2)
      assert(! mv.exitCode, ` ${mv.stderr}`)

      const opts3: PathExistsOptions = {
        bucket,
        target: newPath,
      }
      const existsDst = await client.pathExists(opts3)
      assert(existsDst === true)

      const opts4: PathExistsOptions = {
        ...opts3,
        target,
      }
      const existsOri = await client.pathExists(opts4)
      assert(existsOri === false)
    })

    it('cloud file dst already exists', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`

      const opts: CpOptions = {
        bucket,
        src,
        target,
      }
      const ret = await client.cp(opts)
      assert(! ret.exitCode)

      const dst2 = `${target}-${Date.now().toString()}`
      const opts2: CpOptions = {
        bucket,
        src: target,
        target: dst2,
        encodeSource: true,
      }
      const cp = await client.cp(opts2)
      assert(! cp.exitCode, cp.stderr)

      const mv = await client.mv(opts2)
      assert(mv.exitCode, mv.stderr)
      assert(mv.stderr.includes(Msg.cloudFileAlreadyExists))
    })

    it('link', async () => {
      const src = join(__dirname, 'tsconfig.json')
      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const opts: CpOptions = {
        bucket,
        src,
        target,
      }
      await client.cp(opts)

      const link = `${target}-link`
      const opts2: LinkOptions = {
        bucket,
        src: target,
        target: link,
      }
      const ret = await client.createSymlink(opts2)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      const opts3: PathExistsOptions = {
        bucket,
        target: link,
      }
      const exists = await client.pathExists(opts3)
      assert(exists === true)

      const link2 = `${link}-${Date.now().toString()}`
      const opts4: MvOptions = {
        bucket,
        src: link,
        target: link2,
      }
      const mv = await client.mv(opts4)
      assert(! mv.exitCode)

      const opts5: PathExistsOptions = {
        bucket,
        target: link2,
      }
      const existsDst = await client.pathExists(opts5)
      assert(existsDst === true)

      const opts6: PathExistsOptions = {
        bucket,
        target: link,
      }
      const existsOri = await client.pathExists(opts6)
      assert(existsOri === false)
    })

  })
})


