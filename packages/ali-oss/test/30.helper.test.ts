import assert from 'node:assert/strict'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'

import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import {
  configDownLinks,
  downloadOssutil,
  setBinExecutable,
  validateConfigPath,
  writeConfigFile,
} from '../src/index.js'

import { CI, client, cloudUrlPrefix } from './root.config.js'


const __dirname = genCurrentDirname(import.meta.url)

const plat = platform()

describe(fileShortPath(import.meta.url), () => {
  const binPath = plat === 'win32'
    ? join(homedir(), 'ossutil64.zip')
    : join(homedir(), 'ossutil64')

  describe('writeConfigFile should work', () => {
    it('normal', async () => {
      const config = {
        endpoint: 'foo',
        accessKeyId: 'bar',
        accessKeySecret: 'baz',
      }
      const { path } = await writeConfigFile(config)
      assert(path, 'writeConfigFile failed')
      await validateConfigPath(path)
    })

    it('dup', async () => {
      const config = {
        endpoint: 'foo',
        accessKeyId: 'bar',
        accessKeySecret: 'baz',
      }
      const { path } = await writeConfigFile(config)
      assert(path, 'writeConfigFile failed')
      await validateConfigPath(path)
    })
  })

  describe('downloadOssutil should work', () => {
    it('normal', async () => {
      const link = configDownLinks[plat]
      assert(link, 'link is required')

      const path = await downloadOssutil(link, binPath)
      assert(path, 'downloadOssutil failed')
      if (plat === 'win32') {
        console.info(`You should unzip ${binPath} manually.`)
        return
      }

      client.cmd = path
      console.log({ cmdpath: path })
      const dir = `${cloudUrlPrefix}/4${Math.random().toString()}`
      const ret = await client.mkdir(dir)
      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${dir} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      await client.rm(dir)

    })
  })
})


