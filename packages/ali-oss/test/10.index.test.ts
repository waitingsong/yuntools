import assert from 'node:assert/strict'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'

import { fileShortPath } from '@waiting/shared-core'

import {
  OssClient,
  validateConfigPath,
  writeConfigFile,
} from '../src/index.js'

import {
  cloudUrlPrefix,
  config,
  configPath,
  CI,
  bucket,
} from './root.config.js'

import type { MkdirOptions } from '~/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('init with config file', async () => {
      if (platform() === 'win32') {
        return
      }
      assert(config, 'config is required')

      const configPathRandom = join(homedir(), '.ossutilconfig-' + Math.random().toString())
      const { path } = await writeConfigFile(config, configPathRandom)
      assert(path === configPathRandom, 'writeConfigFile failed')

      const client = new OssClient(configPathRandom)

      const target = `${cloudUrlPrefix}/2${Math.random().toString()}`
      const opts: MkdirOptions = {
        bucket,
        target,
      }
      const ret = await client.mkdir(opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
      assert(ret.data)

      await client.destroy()
      try {
        await validateConfigPath(path)
      }
      catch {
        return
      }
      assert(false, 'validateConfigPath should fail')
    })

    it('init with default config file', async () => {
      assert(config, 'config is required')
      const { path } = await writeConfigFile(config, configPath)
      assert(path === configPath, 'writeConfigFile failed')

      const client = new OssClient(void 0)

      const target = `${cloudUrlPrefix}/3${Math.random().toString()}`
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

  })

})


